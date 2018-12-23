package MockRepositories;

import project.languageapp.Language.Model.Category;
import project.languageapp.Language.Repository.CategoryRepository;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;

public class CategoryRepositoryMocker {

    private static Map<String, Category> data;

    public static void mockRepository(CategoryRepository mockRepository) {
        data = new HashMap<>();

        doAnswer(invocation -> {
            return new ArrayList<>(data.values());
        }).when(mockRepository).findAll();

        doAnswer(invocation -> {
            Category w = (Category) invocation.getArgument(0);
            if (w.getId() == null)
                w.setId(Integer.toString(data.size()));
            data.put(w.getId(), w);
            return w;
        }).when(mockRepository).save(any(Category.class));

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

        List<Category> categories = new ArrayList<>();

        Category category1 = Category.builder()
                .name("Category1")
                //We use new ArrayList because Arrays.asList does not support remove method
                .wordIDs(new ArrayList<>(Arrays.asList("0")))
                .build();

        category1.setPictureURL("language/categories/0_0.jpg");

        Category category2 = Category.builder()
                .name("Category2")
                //We use new ArrayList because Arrays.asList does not support remove method
                .wordIDs(new ArrayList<>())
                .build();

        category2.setPictureURL("language/categories/1_0.jpg");

        categories.add(category1);
        categories.add(category2);

        for (Category w : categories)
            mockRepository.save(w);
    }
}
