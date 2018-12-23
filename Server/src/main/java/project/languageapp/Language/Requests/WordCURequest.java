package project.languageapp.Language.Requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import project.languageapp.Language.Model.Word;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Builder(toBuilder = true)
public class WordCURequest {

    private String name;
    private Word.WordType type;
    private Integer level;
    private List<String> categories;
    private Map<String, String> meanings;
    private Map<String, Map<String, Object>> data;

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    public boolean isValid() {
        if (this.name == null || this.name.length() == 0) {
            LOGGER.severe("WordCURequest does not have a value for field 'name'! Invalid request.");
            return false;
        }

        if (this.type == null) {
            LOGGER.severe("WordCURequest does not have a value for field 'type'! Invalid request.");
            return false;
        }

        if (this.level == null) {
            LOGGER.severe("WordCURequest does not have a value for field 'level'! Invalid request.");
            return false;
        }

        if (this.categories == null) {
            LOGGER.severe("WordCURequest does not have a value for field 'categories'! Invalid request.");
            return false;
        }

        if (this.meanings == null) {
            LOGGER.severe("WordCURequest does not have a value for field 'meanings'! Invalid request.");
            return false;
        }

        return true;
    }
}
