package project.languageapp.Language.RestController.BaseClasses;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.repository.MongoRepository;
import project.languageapp.Language.Model.EntityWithIcon;
import project.languageapp.Wrappers.MPRWrapper;
import java.io.File;
import java.io.FilenameFilter;
import java.util.logging.Logger;

public class ImageManager {

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    @Value("${languageFolder}")
    private String languageFolder;

    //mainFolderName = "words", "users", "languages" or "categories"
    protected <T> T SaveImage(EntityWithIcon entity, MPRWrapper wrapper, MongoRepository<T, String> repository, String mainFolderName) {
        LOGGER.info("A picture is uploaded for " + mainFolderName + ". Saving it...");

        //In which folder we will save the image
        String folderPath = languageFolder + File.separator + mainFolderName;

        /*
            Find the file of the current photo (if exists) for the entity and remove it (at the end, after
            we successfully save the new image).

            If there is a file, its name is in the current format: <entity_id>_<index_id>.jpg.
            Here, index_id shows how many times an image has been uploaded. We will get the index_id
            and index_id + 1 will be the new index_id that we will be using when saving the new picture.
            We use this approach because each time. we want to have a different name for the image
            to prevent caching issues of browsers.
        */
        int newIndex = 1;
        String oldFileName = fileNameWithPrefix(folderPath, entity.getEntityID());
        if (oldFileName != null) {
            //Get index_id part in the name of the old image file
            Integer currentIndex = new Integer(oldFileName.substring(oldFileName.indexOf("_") + 1, oldFileName.indexOf(".jpg")));
            newIndex = currentIndex + 1;
        }

        //The name for the file of the new image
        String fileName = entity.getEntityID() + "_" + Integer.toString(newIndex) + ".jpg";
        String fullFilePath = folderPath + File.separator + fileName;

        try {
            wrapper.saveImageFile(fullFilePath);
        }
        catch (Exception e) {
            LOGGER.severe("Could not save image! (exception + " + e.toString() + ")");
            //noinspection unchecked
            return (T)entity;
        }

        entity.setPictureURL("language" + File.separator + mainFolderName + File.separator + fileName);
        @SuppressWarnings("unchecked") T obj = (T)entity;
        obj = repository.save(obj);

        if (oldFileName != null) {
            DeleteFile(folderPath, oldFileName);
            LOGGER.info("Removed old icon file (" + oldFileName + ")");
        }
        LOGGER.info("Saved icon file (" + fileName + ")");
        return obj;
    }

    protected void RemoveImage(EntityWithIcon entity, String mainFolderName) {

        //In which folder we will search for the image
        String folderPath = languageFolder + File.separator + mainFolderName;

        /*
            Find the first file in "folderPath" whose name matches with the pattern <entity_id>*.
            If a file exists, remove it.
         */
        String fileName = fileNameWithPrefix(folderPath, entity.getEntityID());
        if (fileName != null) {
            DeleteFile(folderPath, fileName);
            LOGGER.info("Deleted file " + fileName);
        }
    }

    private void DeleteFile(String folderName, String fileName) {
        File file = new File(folderName + File.separator + fileName);
        //noinspection ResultOfMethodCallIgnored
        file.delete();
    }

    private String fileNameWithPrefix(String folderName, String prefix) {
        File dir = new File(folderName);
        FilenameFilter filter = (dir1, name) -> name.indexOf(prefix) == 0;
        File[] fList = dir.listFiles(filter);
        return (fList != null && fList.length > 0) ? fList[0].getName(): null;
    }
}
