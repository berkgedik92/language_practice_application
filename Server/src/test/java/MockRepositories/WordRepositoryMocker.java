package MockRepositories;

import project.languageapp.Language.Model.Word;
import project.languageapp.Language.Repository.WordRepository;

import java.util.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;

public class WordRepositoryMocker {

    private static Map<String, Word> data;

    public static void mockRepository(WordRepository mockRepository) {

        data = new HashMap<>();
        doAnswer(invocation -> {
            return new ArrayList<>(data.values());
        }).when(mockRepository).findAll();

        doAnswer(invocation -> {
            Word w = (Word) invocation.getArgument(0);
            if (w.getId() == null)
                w.setId(Integer.toString(data.size()));
            data.put(w.getId(), w);
            return w;
        }).when(mockRepository).save(any(Word.class));

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

        List<Word> words = new ArrayList<>();

        Map<String, Map<String, Object>> data1 = new HashMap<>();
        data1.put("0", new HashMap<>());

        Word word1 = Word.builder()
                .name("word")
                .meanings(new HashMap<>())
                .type(Word.WordType.NOUN)
                .level(1)
                //We use new ArrayList because Arrays.asList does not support remove method
                .categories(new ArrayList<>(Arrays.asList("0")))
                .version(1)
                .data(data1)
                .build();

        word1.setPictureURL("language/words/0_0.jpg");
        word1.addMeaning("0", "word");
        word1.addMeaning("1", "ord");
        words.add(word1);

        Map<String, Map<String, Object>> data2 = new HashMap<>();
        data2.put("0", new HashMap<>());

        Word word2 = Word.builder()
                .name("table")
                .meanings(new HashMap<>())
                .type(Word.WordType.NOUN)
                .level(1)
                .categories(new ArrayList<>())
                .version(1)
                .data(data2)
                .build();

        word1.setPictureURL("language/words/1_0.jpg");
        word2.addMeaning("0", "table");
        word2.addMeaning("1", "bord");
        words.add(word2);

        for (Word w : words)
            mockRepository.save(w);
    }
}
