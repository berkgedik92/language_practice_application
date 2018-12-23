package project.languageapp.Language.RestController;

import project.languageapp.Language.Model.Category;
import project.languageapp.Language.Repository.CategoryRepository;
import project.languageapp.Language.Requests.CategoryCURequest;
import project.languageapp.Language.RestController.BaseClasses.ImageManager;
import project.languageapp.Language.Service.CategoryService;
import project.languageapp.Wrappers.MPRWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import project.languageapp.Wrappers.MPRService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("api/category")
public class CategoryController extends ImageManager {

    @Value("${languageFolder}")
    private String languageFolder;

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private MPRService wrapperService;

    @RequestMapping(value = "/load", method = RequestMethod.GET)
    public ResponseEntity<?> loadCategories() {
        List<Category> categories = categoryRepository.findAll();
        LOGGER.info("Categories load request has been handled.");
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public ResponseEntity<?> deleteCategory(@RequestBody String categoryID) {
        Category category = categoryRepository.findById(categoryID).orElse(null);
        if (category == null) {
            LOGGER.severe("Category with ID " + categoryID + " cannot be deleted (Category with this ID does not exist)");
            return new ResponseEntity<>("Category with ID " + categoryID + " cannot be deleted (Category with this ID does not exist)", HttpStatus.NO_CONTENT);
        }

        RemoveImage(category, "category");

        categoryService.RemoveCategoryFromAllWords(category);
        categoryRepository.removeById(categoryID);
        LOGGER.info("Category with ID " + categoryID + " has been removed");
        return new ResponseEntity<>("Category with ID " + categoryID + " has been removed", HttpStatus.OK);
    }

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    public ResponseEntity<?> saveCategory(MultipartHttpServletRequest request) {
        MPRWrapper wrapper = wrapperService.createInstance(request);
        CategoryCURequest data;
        Boolean pictureUploaded;
        Category category;

        try {
            pictureUploaded = wrapper.getBoolean("pictureUploaded");
            data = wrapper.convertToObject(CategoryCURequest.class);
            if (!data.isValid())
                return new ResponseEntity<>("Cannot parse the category data due to missing field(s). Check server logs for more details.", HttpStatus.BAD_REQUEST);
        }
        catch (Exception e) {
            LOGGER.severe("Cannot parse CategoryCURequest. Error : " + e.toString());
            return new ResponseEntity<>("Cannot parse the category data. Check server logs for more details.", HttpStatus.BAD_REQUEST);
        }

        category = new Category(data);
        category = categoryRepository.save(category);

        /*
            If a picture (category icon) is uploaded, save the file.
            If a picture was already there, remove it and save the image with a
            different filename to prevent browser cache issues.
        */
        if (pictureUploaded)
            category = SaveImage(category, wrapper, categoryRepository, "categories");

        LOGGER.info("Category saved. (ID : " + category.getId() + ")");
        Map<String, String> response = new HashMap<>();
        response.put("pictureURL", category.getPictureURL());
        response.put("id", category.getId());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
