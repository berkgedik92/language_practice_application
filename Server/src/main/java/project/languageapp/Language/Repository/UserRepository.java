package project.languageapp.Language.Repository;

import project.languageapp.Language.Model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User,String> {
    Optional<User> findById(String id);
    void removeById(String id);

    @Query("{'username' : ?0}")
    User findUser(String username);
}
