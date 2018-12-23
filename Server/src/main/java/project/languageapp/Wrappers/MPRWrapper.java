package project.languageapp.Wrappers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Objects;
import java.util.logging.Logger;

/*
    MPR (MultiPart Request) Wrapper

    Wraps a MultipartHttpServletRequest object (which can contain textual data, JSON data
    and binary data such as images)

    Performs extraction operations on MultipartHttpServletRequest object such as
    extracting JSON data and regular data such as string and boolean and saving binary image data into file
 */
public class MPRWrapper {

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);
    private final static ObjectMapper mapper = new ObjectMapper();

    private final MultipartHttpServletRequest request;

    public MPRWrapper(MultipartHttpServletRequest request) {
        this.request = request;
    }

    /*
        Reads the JSON data which is sent as the value of "data" key and returns an object
        of type T which is built out of this JSON data
     */
    public <T> T convertToObject(Class<T> classType) throws IOException  {
        try {
            return mapper.readValue(request.getParameter("data"), classType);
        }
        catch (Exception e) {
            LOGGER.severe("MRPWrapper (convertToObject function) : Cannot convert the JSON data into object (error : " + e.toString() + ")");
            throw e;
        }
    }

    public String getString(String key) {
        return request.getParameter(key);
    }

    public Boolean getBoolean(String key) {
        return Boolean.valueOf(request.getParameter(key));
    }

    /*
        Saves the binary data which is sent as the value of "picture" key to a file

        Input:
            fullFilePath = the path where the picture data will be saved
    */
    public void saveImageFile(String fullFilePath) throws Exception {

        byte[] imageBytes;
        try {
            imageBytes = Objects.requireNonNull(request.getFile("picture")).getBytes();
        }
        catch(Exception e) {
            LOGGER.severe("MRPWrapper (saveImageFile function) : Cannot extract data from 'picture' field (error : " + e.toString() + ")");
            throw new Exception("Cannot extract data from 'picture' field");
        }

        try {
            File file = new File(fullFilePath);
            BufferedOutputStream stream = new BufferedOutputStream(new FileOutputStream(file));
            stream.write(imageBytes);
            stream.close();
        }
        catch (Exception e) {
            LOGGER.severe("MRPWrapper (saveImageFile function) : Cannot save the image data into a file (error : " + e.toString() + ")");
            throw new Exception("Cannot save the image data into a file");
        }
    }
}
