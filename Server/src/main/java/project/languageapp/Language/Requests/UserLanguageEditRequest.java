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
public class UserLanguageEditRequest {

    private String userID;
    private String languageID;
    private List<String> addedWordIDs;
    private List<String> removedWordIDs;

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    public boolean isValid() {
        if (this.userID == null || this.userID.length() == 0) {
            LOGGER.severe("UserLanguageEditRequest does not have a value for field 'userID'! Invalid request.");
            return false;
        }

        if (this.languageID == null || this.languageID.length() == 0) {
            LOGGER.severe("UserLanguageEditRequest does not have a value for field 'languageID'! Invalid request.");
            return false;
        }

        if (this.addedWordIDs == null) {
            LOGGER.severe("UserLanguageEditRequest does not have a value for field 'addedWordIDs'! Invalid request.");
            return false;
        }

        if (this.removedWordIDs == null) {
            LOGGER.severe("UserLanguageEditRequest does not have a value for field 'removedWordIDs'! Invalid request.");
            return false;
        }

        return true;
    }
}
