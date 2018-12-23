package MockRepositories;

import project.languageapp.Language.Model.LanguageStatus;
import project.languageapp.Language.Model.User;
import project.languageapp.Language.Repository.UserRepository;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;

public class UserRepositoryMocker {

    private static Map<String, User> data;
    private static Map<String, User> dataById;

    public static void mockRepository(UserRepository mockRepository) {

        data = new HashMap<>();
        dataById = new HashMap<>();

        doAnswer(invocation -> {
            return new ArrayList<>(data.values());
        }).when(mockRepository).findAll();

        doAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getId() == null)
                user.setId(Integer.toString(data.size()));
            data.put(user.getUsername(), user);
            dataById.put(user.getId(), user);
            return user;
        }).when(mockRepository).save(any(User.class));

        doAnswer(invocation -> {
            String username = invocation.getArgument(0);
            if (data.containsKey(username))
                return data.get(username);
            return null;
        }).when(mockRepository).findUser(any(String.class));

        doAnswer(invocation -> {
            String userId = invocation.getArgument(0);
            if (dataById.containsKey(userId))
                return Optional.of(dataById.get(userId));
            return Optional.empty();
        }).when(mockRepository).findById(any(String.class));

        doAnswer(invocation -> {
            String userId = invocation.getArgument(0);
            if (dataById.containsKey(userId)) {
                User user = dataById.get(userId);
                dataById.remove(userId);
                data.remove(user.getUsername());
            }
            return null;
        }).when(mockRepository).removeById(any(String.class));

        List<User> users = new ArrayList<>();

        Map<String, LanguageStatus> languages = new HashMap<>();
        LanguageStatus languageStatus = new LanguageStatus("0");
        languages.put("0", languageStatus);
        languageStatus.addWord("0");

        User user1 = User.builder()
                .username("user1")
                .password("user1")
                .realName("User 1")
                .languages(languages)
                //We use new ArrayList because Arrays.asList does not support remove method
                .languageIDs(new ArrayList<>(Arrays.asList("0", "1")))
                .currentLanguageIDs(new ArrayList<>(Arrays.asList("0")))
                .mainLanguageIDs(new ArrayList<>(Arrays.asList("1")))
                .version(1)
                .build();

        user1.setPictureURL("language/users/0_0.jpg");

        users.add(user1);
        for (User w : users)
            mockRepository.save(w);
    }
}
