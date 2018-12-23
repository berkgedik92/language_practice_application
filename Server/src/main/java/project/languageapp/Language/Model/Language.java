package project.languageapp.Language.Model;

import lombok.*;
import project.languageapp.Language.Requests.LanguageCURequest;
import org.springframework.data.annotation.Id;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class Language extends EntityWithIcon {

    @Id
    private String id;
    private String name;
    private String alphabet;
    private List<PronounType> pronouns;
    private List<VerbType> verbs;
    private List<NounType> nouns;
    private List<AdjectiveType> adjectives;
    private Integer version;

    public Language(LanguageCURequest createData) {
        this.name = createData.getName();
        this.pronouns = createData.getPronouns();
        this.verbs = createData.getVerbs();
        this.nouns = createData.getNouns();
        this.adjectives = createData.getAdjectives();
        this.alphabet = createData.getAlphabet();
        this.version = 1;
    }

    public void edit(LanguageCURequest editData) {
        this.name = editData.getName();
        this.pronouns = editData.getPronouns();
        this.verbs = editData.getVerbs();
        this.nouns = editData.getNouns();
        this.adjectives = editData.getAdjectives();
        this.alphabet = editData.getAlphabet();
        this.version++;
    }

    @Override
    public String getEntityID() {
        return this.getId();
    }
}
