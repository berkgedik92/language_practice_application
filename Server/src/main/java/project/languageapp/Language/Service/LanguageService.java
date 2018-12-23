package project.languageapp.Language.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.languageapp.Language.Repository.UserRepository;
import project.languageapp.Language.Repository.WordRepository;

@Service
public class LanguageService {

    @Autowired
    private WordRepository wordRepository;

    @Autowired
    private UserRepository userRepository;

    public void RemoveLanguageFromWords(String languageID) {
        wordRepository.findAll().forEach(word -> {
            word.getMeanings().remove(languageID);
            word.getData().remove(languageID);
            wordRepository.save(word);
        });
    }

    public void RemoveLanguageFromUsers(String languageID) {
        userRepository.findAll().forEach(user -> {
            user.getLanguages().remove(languageID);
            user.getCurrentLanguageIDs().remove(languageID);
            user.getMainLanguageIDs().remove(languageID);
            user.getLanguageIDs().remove(languageID);
            userRepository.save(user);
        });
    }
}
