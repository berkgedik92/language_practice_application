import MockMRP.MPRServiceMocker;
import MockRepositories.LanguageRepositoryMocker;
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
import project.languageapp.Language.Model.Language;
import project.languageapp.Language.Repository.LanguageRepository;
import project.languageapp.Language.Requests.LanguageCURequest;
import project.languageapp.Language.RestController.LanguageController;
import project.languageapp.Language.Service.LanguageService;
import project.languageapp.Wrappers.MPRService;

import java.util.*;
import static junit.framework.TestCase.assertTrue;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;

@RunWith(MockitoJUnitRunner.Silent.class)
public class LanguageControllerTest {

    @InjectMocks
    private static LanguageController languageController;

    @Mock
    private LanguageRepository languageRepository;

    @Mock
    private LanguageService languageService;

    @Mock
    private MPRService wrapperService;

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
        LanguageRepositoryMocker.mockRepository(languageRepository);
        MPRServiceMocker.mockMPRService(wrapperService);
    }

    private List<Language> checkLanguageAmountAndReturnList(long expectedLength) {
        ResponseEntity<?> response = languageController.loadLanguages();
        List<Language> languages = (List<Language>) response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.OK, status);
        assertEquals(expectedLength, languages.size());
        return languages;
    }

    @Test
    public void checkIfSameWithInitialDB() {
        List<Language> languages = checkLanguageAmountAndReturnList(2);
        assertEquals("English", languages.get(0).getName());
    }

    @Test
    public void deleteExistingLanguage() {
        ResponseEntity<?> response = languageController.deleteLanguage("0");
        String result = (String) response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.OK, status);
        checkLanguageAmountAndReturnList(1);
    }

    @Test
    public void tryToDeleteNonExistingLanguage() {
        ResponseEntity<?> response = languageController.deleteLanguage("INVALID_ID");
        String result = (String) response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.NO_CONTENT, status);
        checkIfSameWithInitialDB();
    }

    @Test
    public void saveANewLanguage() {

        Map<String, Object> request = new HashMap<>();

        request.put("data", LanguageCURequest.builder()
                .name("French")
                .alphabet("rty")
                .pronouns(new ArrayList<>())
                .verbs(new ArrayList<>())
                .nouns(new ArrayList<>())
                .adjectives(new ArrayList<>())
                .build());

        request.put("pictureUploaded", false);
        request.put("editing", false);
        MPRServiceMocker.setRequest(request);

        languageController.createOrEditLanguage(mock(MultipartHttpServletRequest.class));

        List<Language> languages = checkLanguageAmountAndReturnList(3);
        Optional<Language> myLanguage = languages.stream().filter(language -> language.getName().equals("French")).findFirst();

        assertTrue(myLanguage.isPresent());
        Language u = myLanguage.get();

        assertEquals(u.getAlphabet(), "rty");
    }

    @Test
    public void editALanguage() {

        Language wInit = languageRepository.findAll().stream().filter(language -> language.getName().equals("English")).findFirst().get();

        Map<String, Object> request = new HashMap<>();

        request.put("data", LanguageCURequest.builder()
                .name("English")
                .alphabet("abcd")
                .pronouns(new ArrayList<>())
                .verbs(new ArrayList<>())
                .nouns(new ArrayList<>())
                .adjectives(new ArrayList<>())
                .build());

        request.put("pictureUploaded", false);
        request.put("editing", true);
        request.put("id", wInit.getId());
        MPRServiceMocker.setRequest(request);

        languageController.createOrEditLanguage(mock(MultipartHttpServletRequest.class));

        List<Language> languages = checkLanguageAmountAndReturnList(2);
        Optional<Language> myLanguage = languages.stream().filter(language -> language.getName().equals("English")).findFirst();

        assertTrue(myLanguage.isPresent());
        Language u = myLanguage.get();

        assertEquals(u.getAlphabet(), "abcd");
    }

    @Test
    public void editANonExistingWord() {

        Map<String, Object> request = new HashMap<>();
        Map<String, String> meanings = new HashMap<>();

        request.put("data", LanguageCURequest.builder()
                .name("English")
                .alphabet("abcd")
                .pronouns(new ArrayList<>())
                .verbs(new ArrayList<>())
                .nouns(new ArrayList<>())
                .adjectives(new ArrayList<>())
                .build());

        request.put("pictureUploaded", false);
        request.put("editing", true);
        request.put("id", "INVALID_ID");
        MPRServiceMocker.setRequest(request);

        ResponseEntity<?> response = languageController.createOrEditLanguage(mock(MultipartHttpServletRequest.class));
        assertEquals(response.getStatusCode(), HttpStatus.BAD_REQUEST);

        checkIfSameWithInitialDB();
    }
}
