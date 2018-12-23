import MockMRP.MPRServiceMocker;
import MockRepositories.CategoryRepositoryMocker;
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
import project.languageapp.Language.Model.Category;
import project.languageapp.Language.Repository.CategoryRepository;
import project.languageapp.Language.Requests.CategoryCURequest;
import project.languageapp.Language.RestController.CategoryController;
import project.languageapp.Language.Service.CategoryService;
import project.languageapp.Wrappers.MPRService;

import java.util.*;
import static junit.framework.TestCase.assertTrue;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;

@RunWith(MockitoJUnitRunner.Silent.class)
public class CategoryControllerTest {

    @InjectMocks
    private static CategoryController categoryController;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CategoryService categoryService;

    @Mock
    private MPRService wrapperService;

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
        CategoryRepositoryMocker.mockRepository(categoryRepository);
        MPRServiceMocker.mockMPRService(wrapperService);
    }

    private List<Category> checkCategoryAmountAndReturnList(long expectedLength) {
        ResponseEntity<?> response = categoryController.loadCategories();
        List<Category> categories = (List<Category>) response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.OK, status);
        assertEquals(expectedLength, categories.size());
        return categories;
    }

    @Test
    public void checkIfSameWithInitialDB() {
        List<Category> categories = checkCategoryAmountAndReturnList(2);
        assertEquals("Category1", categories.get(0).getName());
    }

    @Test
    public void deleteExistingCategory() {
        ResponseEntity<?> response = categoryController.deleteCategory("0");
        String result = (String) response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.OK, status);
        checkCategoryAmountAndReturnList(1);
    }

    @Test
    public void tryToDeleteNonExistingCategory() {
        ResponseEntity<?> response = categoryController.deleteCategory("INVALID_ID");
        String result = (String) response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.NO_CONTENT, status);
        checkIfSameWithInitialDB();
    }

    @Test
    public void saveANewCategory() {

        Map<String, Object> request = new HashMap<>();
        request.put("data", CategoryCURequest.builder()
                .name("New Category")
                .build());

        request.put("pictureUploaded", false);
        request.put("editing", false);
        MPRServiceMocker.setRequest(request);

        categoryController.saveCategory(mock(MultipartHttpServletRequest.class));

        List<Category> categories = checkCategoryAmountAndReturnList(3);
        Optional<Category> myCategory = categories.stream().filter(language -> language.getName().equals("New Category")).findFirst();

        assertTrue(myCategory.isPresent());
        Category u = myCategory.get();

        assertEquals(u.getName(), "New Category");
    }
}
