package project.languageapp.Language.Requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.logging.Logger;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Builder(toBuilder = true)
public class CategoryCURequest {

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    private String name;

    public boolean isValid() {
        if (this.name == null || this.name.length() == 0) {
            LOGGER.severe("CategoryCURequest does not have a value for field 'name'! Invalid request.");
            return false;
        }
        return true;
    }
}
