package project.languageapp.Language.Requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.List;
import java.util.logging.Logger;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Builder(toBuilder = true)
public class UserCURequest {

    private String username;
    private String password;
    private String realName;
    private List<String> languageIDs;
    private List<String> currentLanguageIDs;
    private List<String> mainLanguageIDs;

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    public boolean isValid() {
        if (this.username == null || this.username.length() == 0) {
            LOGGER.severe("UserCURequest does not have a value for field 'username'! Invalid request.");
            return false;
        }

        if (this.password == null || this.password.length() == 0) {
            LOGGER.severe("UserCURequest does not have a value for field 'password'! Invalid request.");
            return false;
        }

        if (this.realName == null || this.realName.length() == 0) {
            LOGGER.severe("UserCURequest does not have a value for field 'realName'! Invalid request.");
            return false;
        }

        if (this.languageIDs == null) {
            LOGGER.severe("UserCURequest does not have a value for field 'languageIDs'! Invalid request.");
            return false;
        }

        if (this.currentLanguageIDs == null) {
            LOGGER.severe("UserCURequest does not have a value for field 'currentLanguageIDs'! Invalid request.");
            return false;
        }

        if (this.mainLanguageIDs == null) {
            LOGGER.severe("UserCURequest does not have a value for field 'mainLanguageIDs'! Invalid request.");
            return false;
        }

        return true;
    }
}
