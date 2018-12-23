package project.languageapp.Language.Model;

import lombok.*;
import org.springframework.data.annotation.Id;
import project.languageapp.Language.Requests.WordCURequest;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder=true)
public class Word extends EntityWithIcon {

    public enum WordType {NOUN, VERB, ADJECTIVE}

    @Id
    private String id;
    private String name;
    private Map<String, String> meanings;
    private WordType type;
    private Integer level;
    private List<String> categories;
    private Integer version;

    //languageID -> ExtraData
    private Map<String, Map<String, Object>> data;

    public Word(WordCURequest createData) {
        this.name = createData.getName();
        this.meanings = createData.getMeanings();
        this.type = createData.getType();
        this.level = createData.getLevel();
        this.categories = createData.getCategories();
        this.data = createData.getData();
        this.version = 1;
    }

    public void edit(WordCURequest createData) {
        this.name = createData.getName();
        this.meanings = createData.getMeanings();
        this.type = createData.getType();
        this.level = createData.getLevel();
        this.categories = createData.getCategories();
        this.data = createData.getData();
        this.version++;
    }

    public void addMeaning(String languageID, String meaning) {
        if (meanings != null)
            meanings.put(languageID, meaning);
    }

    @Override
    public String getEntityID() {
        return this.getId();
    }

}
