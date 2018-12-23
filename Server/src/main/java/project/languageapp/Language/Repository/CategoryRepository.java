package project.languageapp.Language.Repository;

import project.languageapp.Language.Model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface CategoryRepository extends MongoRepository<Category,String> {
    Optional<Category> findById(String id);
    void removeById(String id);
}
