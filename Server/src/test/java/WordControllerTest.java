import MockMRP.MPRServiceMocker;
import MockRepositories.WordRepositoryMocker;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import project.languageapp.Language.Model.Word;
import project.languageapp.Language.Repository.WordRepository;
import project.languageapp.Language.Requests.WordCURequest;
import project.languageapp.Language.RestController.WordController;
import project.languageapp.Language.Service.WordService;
import project.languageapp.Wrappers.MPRService;
import java.util.*;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.Silent.class)
public class WordControllerTest {

    @InjectMocks
    private static WordController wordController;

    @Mock
    private static WordRepository wordRepository;

    @Mock
    private static WordService wordService;

    @Mock
    private static MPRService wrapperService;

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
        WordRepositoryMocker.mockRepository(wordRepository);
        MPRServiceMocker.mockMPRService(wrapperService);
    }

    private List<Word> checkWordAmountAndReturnList(long expectedLength) {
        ResponseEntity<?> response = wordController.loadWords();
        List<Word> words = (List<Word>) response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.OK, status);
        assertEquals(expectedLength, words.size());
        return words;
    }

    @Test
    public void checkIfSameWithInitialDB() {
        List<Word> words = checkWordAmountAndReturnList(2);
        assertEquals("table", words.get(1).getMeanings().get("0"));
        assertEquals("word", words.get(0).getMeanings().get("0"));
    }

    @Test
    public void deleteExistingWord() {
        ResponseEntity<?> response = wordController.deleteWord("0");
        String result = (String) response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.OK, status);
        checkWordAmountAndReturnList(1);
    }

    @Test
    public void tryToDeleteNonExistingWord() {
        ResponseEntity<?> response = wordController.deleteWord("INVALID_ID");
        String result = (String) response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.NO_CONTENT, status);
        checkIfSameWithInitialDB();
    }

    @Test
    public void saveANewWord() {

        Map<String, String> meanings = new HashMap<>();
        meanings.put("0", "tree");

        Map<String, Object> request = new HashMap<>();

        request.put("data", WordCURequest.builder()
                .name("tree")
                .type(Word.WordType.NOUN)
                .level(1)
                .categories(new ArrayList<>())
                .meanings(meanings)
                .data(new HashMap<>())
                .build());

        request.put("pictureUploaded", false);
        request.put("editing", false);
        MPRServiceMocker.setRequest(request);

        wordController.createOrEditWord(mock(MultipartHttpServletRequest.class));

        List<Word> words = checkWordAmountAndReturnList(3);
        Optional<Word> myWord = words.stream().filter(word -> word.getName().equals("tree")).findFirst();

        assertTrue(myWord.isPresent());
        Word w = myWord.get();

        assertEquals(w.getMeanings().get("0"), "tree");
    }

    @Test
    public void editAWord() {

        Word wInit = wordRepository.findAll().stream().filter(word -> word.getName().equals("table")).findFirst().get();

        Map<String, String> meanings = new HashMap<>();
        meanings.put("0", "chair");

        Map<String, Object> request = new HashMap<>();

        request.put("data", WordCURequest.builder()
                .name("table")
                .type(Word.WordType.NOUN)
                .level(1)
                .categories(new ArrayList<>())
                .meanings(meanings)
                .data(new HashMap<>())
                .build());

        request.put("pictureUploaded", false);
        request.put("editing", true);
        request.put("id", wInit.getId());
        MPRServiceMocker.setRequest(request);

        wordController.createOrEditWord(mock(MultipartHttpServletRequest.class));

        List<Word> words = checkWordAmountAndReturnList(2);
        Optional<Word> myWord = words.stream().filter(word -> word.getName().equals("table")).findFirst();

        assertTrue(myWord.isPresent());
        Word w = myWord.get();

        assertEquals(w.getMeanings().get("0"), "chair");
    }

    @Test
    public void editANonExistingWord() {

        Map<String, String> meanings = new HashMap<>();
        Map<String, Object> request = new HashMap<>();

        request.put("data", WordCURequest.builder()
                .name("table")
                .type(Word.WordType.NOUN)
                .level(1)
                .categories(new ArrayList<>())
                .meanings(meanings)
                .data(new HashMap<>())
                .build());

        request.put("pictureUploaded", false);
        request.put("editing", true);
        request.put("id", "INVALID_ID");

        MPRServiceMocker.setRequest(request);

        ResponseEntity<?> response = wordController.createOrEditWord(mock(MultipartHttpServletRequest.class));
        assertEquals(response.getStatusCode(), HttpStatus.BAD_REQUEST);

        checkIfSameWithInitialDB();
    }
}
