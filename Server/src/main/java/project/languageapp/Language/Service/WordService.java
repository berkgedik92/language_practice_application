package project.languageapp.Language.Service;

import project.languageapp.Language.Model.Word;
import project.languageapp.Language.Repository.CategoryRepository;
import project.languageapp.Language.Repository.UserRepository;
import project.languageapp.Language.Repository.WordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WordService {

    @Autowired
    private WordRepository wordRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    public void AddWordToCategories(String wordID, List<String> categoryIDs) {
        categoryIDs.forEach(categoryID -> {
            categoryRepository.findById(categoryID).ifPresent(category -> {
                category.getWordIDs().add(wordID);
                categoryRepository.save(category);
            });
        });
    }

    public void RemoveWordFromCategories(String wordID, List<String> categoryIDs) {

        categoryIDs.forEach(categoryID -> {
            categoryRepository.findById(categoryID).ifPresent(category -> {
                category.getWordIDs().remove(wordID);
                categoryRepository.save(category);
            });
        });
    }

    public void RemoveWordFromAllCategories(Word word) {

        word.getCategories().forEach(categoryID -> {
            categoryRepository.findById(categoryID).ifPresent(category -> {
                category.getWordIDs().remove(word.getId());
                categoryRepository.save(category);
            });
        });
    }

    public void RemoveWordFromUsers(String wordID) {

        userRepository.findAll().forEach(user -> {
            user.getLanguages().forEach((languageID, languageStatus) -> {
                languageStatus.removeWord(wordID);
            });

            userRepository.save(user);
        });
    }
}
