package project.languageapp.Language.Model;

import lombok.*;
import org.springframework.data.annotation.Id;
import project.languageapp.Language.Requests.UserCURequest;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class User extends EntityWithIcon {

    @Id
    private String id;

    private String username;
    private String password;
    private String realName;
    private Map<String, LanguageStatus> languages = new HashMap<>();
    private List<String> languageIDs;
    private List<String> currentLanguageIDs;
    private List<String> mainLanguageIDs;
    private Integer version;

    public User(String username, String realName, String password, String pictureURL) {
        this.username = username;
        this.realName = realName;
        this.password = password;
        this.languages = new HashMap<>();
        this.languageIDs = new ArrayList<>();
        this.version = 1;
        this.setPictureURL(pictureURL);
    }

    public User(UserCURequest data) {
        this.username = data.getUsername();
        this.password = data.getPassword();
        this.realName = data.getRealName();
        this.languageIDs = data.getLanguageIDs();
        this.currentLanguageIDs = data.getCurrentLanguageIDs();
        this.mainLanguageIDs = data.getMainLanguageIDs();
        this.version = 1;
        addLanguages(data.getLanguageIDs());
    }

    public void edit(UserCURequest data) {
        this.username = data.getUsername();
        this.password = data.getPassword();
        this.realName = data.getRealName();
        this.languageIDs = data.getLanguageIDs();
        this.currentLanguageIDs = data.getCurrentLanguageIDs();
        this.mainLanguageIDs = data.getMainLanguageIDs();
        this.version++;
        addLanguages(data.getLanguageIDs());
    }

    public void userLanguageUpdater(String languageID, List<String> addedWordIDs, List<String> removedWordIDs) {
        LanguageStatus status = languages.get(languageID);
        for (String id : addedWordIDs)
            status.addWord(id);
        for (String id : removedWordIDs)
            status.removeWord(id);
    }

    public void addLanguages(List<String> languageIDs) {
        Set<String> existingLanguages = languages.keySet();
        for (String cur : existingLanguages)
            if (!languageIDs.contains(cur))
                languages.remove(cur);

        for (String cur : languageIDs)
            if (!languages.containsKey(cur))
                languages.put(cur, new LanguageStatus(cur));
    }

    public Set<String> getAssignedWords(String languageID) {
        return this.getLanguages().get(languageID).getAssignedWords().keySet();
    }

    @Override
    public String getEntityID() {
        return this.getId();
    }
}
