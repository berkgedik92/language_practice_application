package project.languageapp;

import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import project.languageapp.Language.Model.User;
import project.languageapp.Language.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@Configuration
@EnableScheduling
public class ServerApplication implements WebMvcConfigurer, CommandLineRunner {

	@Autowired
	private UserRepository userRepository;

	public static void main(String[] args) {
		SpringApplication.run(ServerApplication.class, args);
	}

	@Override
	public void run(String... args) {

		//Create a user if it does not exists
        if (userRepository.findUser("user1") == null)
            userRepository.save(new User("user1", "user1", "user1", "language/users/user1.gif"));
    }
}
