package project.languageapp.Language.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.languageapp.Language.Model.Category;
import project.languageapp.Language.Repository.WordRepository;

@Service
public class CategoryService {

    @Autowired
    private WordRepository wordRepository;

    public void RemoveCategoryFromAllWords(Category category) {
        category.getWordIDs().forEach(wordID -> {
            wordRepository.findById(wordID).ifPresent(word -> {
                word.getCategories().remove(category.getId());
                wordRepository.save(word);
            });
        });
    }
}
