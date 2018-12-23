import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.internal.util.reflection.FieldSetter;
import org.mockito.junit.MockitoJUnitRunner;
import project.languageapp.Language.Model.User;
import project.languageapp.Language.Repository.UserRepository;
import project.languageapp.Services.TokenManager;
import java.util.*;

import static junit.framework.TestCase.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;

@RunWith(MockitoJUnitRunner.Silent.class)
public class TokenManagerTest {

    @InjectMocks
    private static TokenManager tokenManager;

    @Mock
    private static UserRepository userRepository;

    private static Map<String, User> usersData;

    @Before
    public void setUp() throws Exception {
        usersData = new HashMap<>();
        List<User> users = new ArrayList<>();

        User user1 = User.builder()
                .username("user1")
                .password("user1")
                .realName("User 1")
                .languages(new HashMap<>())
                .languageIDs(Arrays.asList("1", "2"))
                .currentLanguageIDs(Arrays.asList("1"))
                .mainLanguageIDs(Arrays.asList("2"))
                .version(1)
                .build();

        users.add(user1);

        MockitoAnnotations.initMocks(this);

        doAnswer(invocation -> {
            User w = (User) invocation.getArgument(0);
            if (w.getId() == null)
                w.setId(Integer.toString(usersData.size()));
            usersData.put(w.getUsername(), w);
            return w;
        }).when(userRepository).save(any(User.class));

        doAnswer(invocation -> {
            String username = invocation.getArgument(0);
            if (usersData.containsKey(username))
                return usersData.get(username);
            return null;
        }).when(userRepository).findUser(any(String.class));

        for (User w : users)
            userRepository.save(w);

        FieldSetter.setField(tokenManager, TokenManager.class.getDeclaredField("JWTKey"), "12345");
    }

    public String getToken(String username) throws Exception {
        return tokenManager.produce(username);
    }

    @Test
    public void getTokenForValidUser() throws Exception {
        getToken("user1");
    }

    @Test(expected = Exception.class)
    public void getTokenForNonExistingUser() throws Exception {
        getToken("nonexisting_user");
    }

    @Test(expected = Exception.class)
    public void sendInvalidToken() throws Exception {
        tokenManager.check("invalid_token");
    }

    @Test(expected = Exception.class)
    public void sendTokenOfNonExistingUser() throws Exception {
        String token = getToken("user1");
        usersData = new HashMap<>();
        tokenManager.check(token);
    }

    @Test
    public void sendValidToken() throws Exception {
        String token = getToken("user1");
        User user = tokenManager.check(token);
        assertTrue(user.getRealName().equals("User 1"));
    }
}

