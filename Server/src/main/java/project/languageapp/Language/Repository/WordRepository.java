package project.languageapp.Language.Repository;

import project.languageapp.Language.Model.Word;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface WordRepository extends MongoRepository<Word,String> {
    Optional<Word> findById(String id);
    void removeById(String id);
}
