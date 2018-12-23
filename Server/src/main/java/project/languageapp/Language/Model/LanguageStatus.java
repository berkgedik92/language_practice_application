package project.languageapp.Language.Model;

import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class LanguageStatus {

    private String languageID;

    //WordID -> user performance on this word (To be implemented in the future)
    private Map<String, Object> assignedWords;
    private Integer version;

    public LanguageStatus(String languageID) {
        this.languageID = languageID;
        this.assignedWords = new HashMap<>();
        this.version = 1;
    }

    public boolean isWordExist(String wordID) {
        return assignedWords.containsKey(wordID);
    }

    public void addWord(String wordID) {
        if (!assignedWords.containsKey(wordID)) {
            assignedWords.put(wordID, null);
            this.version++;
        }
    }

    public void removeWord(String wordID) {
        if (assignedWords.containsKey(wordID)) {
            assignedWords.remove(wordID);
            this.version++;
        }
    }

    /*
        To be implemented in the future (it will keep statistics about this word such as the
        times this word has been asked, in which times a user gives correct answer about this word
        etc... (so the mobile app will be able to pick words which were not learned properly and
        ask about such words more frequently)
     */
    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    @Setter
    public class WordPerformance {
        private String wordID;
    }
}
