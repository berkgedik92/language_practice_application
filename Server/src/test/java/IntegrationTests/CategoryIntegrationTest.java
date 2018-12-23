package IntegrationTests;


import MockMRP.MPRServiceMocker;
import MockRepositories.CategoryRepositoryMocker;
import MockRepositories.WordRepositoryMocker;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;
import project.languageapp.Language.Model.Word;
import project.languageapp.Language.Repository.CategoryRepository;
import project.languageapp.Language.Repository.WordRepository;
import project.languageapp.Language.RestController.CategoryController;
import project.languageapp.ServerApplication;
import project.languageapp.Wrappers.MPRService;

import java.util.List;

import static junit.framework.TestCase.assertTrue;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = ServerApplication.class)
public class CategoryIntegrationTest {

    @MockBean
    private CategoryRepository categoryRepository;

    @MockBean
    private WordRepository wordRepository;

    @MockBean
    private MPRService wrapperService;

    @Autowired
    private CategoryController categoryController;

    @Before
    public void setUp() throws Exception {
        CategoryRepositoryMocker.mockRepository(categoryRepository);
        WordRepositoryMocker.mockRepository(wordRepository);
        MPRServiceMocker.mockMPRService(wrapperService);
    }

    @Test
    public void deleteACategory() {
        Word word = wordRepository.findById("0").get();
        assertTrue(word.getCategories().contains("0"));

        categoryController.deleteCategory("0");

        word = wordRepository.findById("0").get();
        assertTrue(!word.getCategories().contains("0"));
    }

}
