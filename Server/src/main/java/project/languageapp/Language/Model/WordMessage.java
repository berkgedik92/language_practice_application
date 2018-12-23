package project.languageapp.Language.Model;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.Map;

@Getter
@Setter
//Objects of this class are used by the mobile application
public class WordMessage {

    private String wordID;
    private String pictureURL;
    private String mainMeaning;
    private String currentMeaning;
    private Word.WordType type;
    private Integer level;
    private List<String> categories;
    private Map<String, Object> otherData;

    public WordMessage(Word word, String currentLanguageID, String mainLanguageID) {

        this.wordID = word.getId();
        this.pictureURL = word.getPictureURL();
        this.mainMeaning = word.getMeanings().get(mainLanguageID);
        this.currentMeaning = word.getMeanings().get(currentLanguageID);
        this.type = word.getType();
        this.level = word.getLevel();
        this.categories = word.getCategories();
        this.otherData = word.getData().get(currentLanguageID);
    }
}
