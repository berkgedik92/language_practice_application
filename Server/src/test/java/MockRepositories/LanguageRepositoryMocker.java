package MockRepositories;

import project.languageapp.Language.Model.Language;
import project.languageapp.Language.Repository.LanguageRepository;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;

public class LanguageRepositoryMocker {

    private static Map<String, Language> data;

    public static void mockRepository(LanguageRepository mockRepository) {
        data = new HashMap<>();

        doAnswer(invocation -> {
            return new ArrayList<>(data.values());
        }).when(mockRepository).findAll();

        doAnswer(invocation -> {
            Language w = (Language) invocation.getArgument(0);
            if (w.getId() == null)
                w.setId(Integer.toString(data.size()));
            data.put(w.getId(), w);
            return w;
        }).when(mockRepository).save(any(Language.class));

        doAnswer(invocation -> {
            String wordID = invocation.getArgument(0);
            if (data.containsKey(wordID))
                return Optional.of(data.get(wordID));
            return Optional.empty();
        }).when(mockRepository).findById(any(String.class));

        doAnswer(invocation -> {
            String wordID = invocation.getArgument(0);
            data.remove(wordID);
            return null;
        }).when(mockRepository).removeById(any(String.class));

        List<Language> languages = new ArrayList<>();

        Language language1 = Language.builder()
                .name("English")
                .alphabet("abc")
                .pronouns(new ArrayList<>())
                .verbs(new ArrayList<>())
                .nouns(new ArrayList<>())
                .adjectives(new ArrayList<>())
                .version(1)
                .build();

        language1.setPictureURL("language/languages/0_0.jpg");

        languages.add(language1);

        Language language2 = Language.builder()
                .name("Swedish")
                .alphabet("åäö")
                .pronouns(new ArrayList<>())
                .verbs(new ArrayList<>())
                .nouns(new ArrayList<>())
                .adjectives(new ArrayList<>())
                .version(1)
                .build();

        language2.setPictureURL("language/languages/1_0.jpg");

        languages.add(language2);

        for (Language w : languages)
            mockRepository.save(w);

    }
}
