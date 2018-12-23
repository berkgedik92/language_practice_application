package project.languageapp.Language.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import project.languageapp.Language.Requests.CategoryCURequest;
import org.springframework.data.annotation.Id;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class Category extends EntityWithIcon {

    @Id
    private String id;
    private String name;
    private List<String> wordIDs = new ArrayList<>();

    @JsonIgnore
    private Integer version;

    public Category(CategoryCURequest createData) {
        this.name = createData.getName();
        this.version = 1;
    }

    /*public void edit(CategoryCURequest editData) {
        this.name = editData.getName();
        this.version++;
    }*/

    @Override
    public String getEntityID() {
        return this.getId();
    }
}
