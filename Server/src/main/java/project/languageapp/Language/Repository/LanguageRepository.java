package project.languageapp.Language.Repository;

import project.languageapp.Language.Model.Language;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface LanguageRepository extends MongoRepository<Language,String> {
    Optional<Language> findById(String id);
    void removeById(String id);
}
