package IntegrationTests;

import MockMRP.MPRServiceMocker;
import MockRepositories.CategoryRepositoryMocker;
import MockRepositories.UserRepositoryMocker;
import MockRepositories.WordRepositoryMocker;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import project.languageapp.Language.Model.Category;
import project.languageapp.Language.Model.User;
import project.languageapp.Language.Model.Word;
import project.languageapp.Language.Repository.CategoryRepository;
import project.languageapp.Language.Repository.UserRepository;
import project.languageapp.Language.Repository.WordRepository;
import project.languageapp.Language.Requests.WordCURequest;
import project.languageapp.Language.RestController.WordController;
import project.languageapp.ServerApplication;
import project.languageapp.Wrappers.MPRService;

import java.util.*;

import static junit.framework.TestCase.assertTrue;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = ServerApplication.class)
public class WordIntegrationTest {

    @MockBean
    private WordRepository wordRepository;

    @MockBean
    private MPRService wrapperService;

    @MockBean
    private CategoryRepository categoryRepository;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private WordController wordController;

    @Before
    public void setUp() throws Exception {
        WordRepositoryMocker.mockRepository(wordRepository);
        MPRServiceMocker.mockMPRService(wrapperService);
        CategoryRepositoryMocker.mockRepository(categoryRepository);
        UserRepositoryMocker.mockRepository(userRepository);
    }

    @Test
    public void deleteAWord() {

        //Check if the category with ID = 0 has the word with ID = 0
        List<Category> allCategories = categoryRepository.findAll();

        Category myCategory = allCategories.stream().filter(category -> category.getId().equals("0")).findFirst().get();
        assertTrue(myCategory.getWordIDs().contains("0"));

        List<User> allUsers = userRepository.findAll();

        User myUser = allUsers.stream().filter(user -> user.getId().equals("0")).findFirst().get();
        assertTrue(myUser.getLanguages().get("0").getAssignedWords().containsKey("0"));

        ResponseEntity<?> response = wordController.deleteWord("0");
        String result = (String) response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.OK, status);

        allCategories = categoryRepository.findAll();

        myCategory = allCategories.stream().filter(category -> category.getId().equals("0")).findFirst().get();
        assertTrue(!myCategory.getWordIDs().contains("0"));

        allUsers = userRepository.findAll();

        myUser = allUsers.stream().filter(user -> user.getId().equals("0")).findFirst().get();
        assertTrue(!myUser.getLanguages().get("0").getAssignedWords().containsKey("0"));
    }

    @Test
    public void updateCategories() {

        List<Word> allWords = wordRepository.findAll();
        Word myWord = allWords.stream().filter(word -> word.getId().equals("0")).findFirst().get();

        List<Category> allCategories = categoryRepository.findAll();
        Category category1 = allCategories.stream().filter(category -> category.getId().equals("0")).findFirst().get();
        Category category2 = allCategories.stream().filter(category -> category.getId().equals("1")).findFirst().get();

        assertTrue(myWord.getCategories().contains("0"));
        assertTrue(!myWord.getCategories().contains("1"));

        assertTrue(category1.getWordIDs().contains("0"));
        assertTrue(!category2.getWordIDs().contains("0"));

        Map<String, String> meanings = new HashMap<>();
        meanings.put("0", "word");

        Map<String, Object> request = new HashMap<>();

        request.put("data", WordCURequest.builder()
                .name("word")
                .type(project.languageapp.Language.Model.Word.WordType.NOUN)
                .level(1)
                .categories(new ArrayList<>(Arrays.asList("1")))
                .meanings(meanings)
                .data(new HashMap<>())
                .build());

        request.put("pictureUploaded", false);
        request.put("editing", true);
        request.put("id", "0");
        MPRServiceMocker.setRequest(request);

        wordController.createOrEditWord(mock(MultipartHttpServletRequest.class));

        allWords = wordRepository.findAll();
        myWord = allWords.stream().filter(word -> word.getId().equals("0")).findFirst().get();

        allCategories = categoryRepository.findAll();
        category1 = allCategories.stream().filter(category -> category.getId().equals("0")).findFirst().get();
        category2 = allCategories.stream().filter(category -> category.getId().equals("1")).findFirst().get();

        assertTrue(!myWord.getCategories().contains("0"));
        assertTrue(myWord.getCategories().contains("1"));

        assertTrue(!category1.getWordIDs().contains("0"));
        assertTrue(category2.getWordIDs().contains("0"));
    }
}
