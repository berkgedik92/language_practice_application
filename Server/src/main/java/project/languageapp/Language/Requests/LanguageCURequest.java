package project.languageapp.Language.Requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import project.languageapp.Language.Model.AdjectiveType;
import project.languageapp.Language.Model.NounType;
import project.languageapp.Language.Model.PronounType;
import project.languageapp.Language.Model.VerbType;
import java.util.List;
import java.util.logging.Logger;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Builder(toBuilder = true)
public class LanguageCURequest {

    private String name;
    private String alphabet;
    private List<PronounType> pronouns;
    private List<VerbType> verbs;
    private List<NounType> nouns;
    private List<AdjectiveType> adjectives;

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    public boolean isValid() {
        if (this.name == null || this.name.length() == 0) {
            LOGGER.severe("LanguageCURequest does not have a value for field 'name'! Invalid request.");
            return false;
        }

        if (this.alphabet == null || this.alphabet.length() == 0) {
            LOGGER.severe("LanguageCURequest does not have a value for field 'alphabet'! Invalid request.");
            return false;
        }

        if (this.pronouns == null) {
            LOGGER.severe("LanguageCURequest does not have a value for field 'pronouns'! Invalid request.");
            return false;
        }

        if (this.verbs == null) {
            LOGGER.severe("LanguageCURequest does not have a value for field 'verbs'! Invalid request.");
            return false;
        }

        if (this.nouns == null) {
            LOGGER.severe("LanguageCURequest does not have a value for field 'nouns'! Invalid request.");
            return false;
        }

        if (this.adjectives == null) {
            LOGGER.severe("LanguageCURequest does not have a value for field 'adjectives'! Invalid request.");
            return false;
        }

        return true;
    }
}
