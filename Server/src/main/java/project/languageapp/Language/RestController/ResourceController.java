package project.languageapp.Language.RestController;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.logging.Logger;

/*
    Returns file data to client
 */

@Controller
@RequestMapping("langapp/language/")
public class ResourceController {

    @Value("${languageFolder}")
    private String languageFolder;

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    @RequestMapping(
        value = "/{folder}/{filename}",
        method = RequestMethod.GET,
        produces = {MediaType.APPLICATION_OCTET_STREAM_VALUE}
    )
    public HttpEntity<?> loadFile(@PathVariable String folder, @PathVariable String filename) throws Exception {
        String fullFilePath = languageFolder + File.separator + folder + File.separator + filename;
        Path path = Paths.get(fullFilePath);
        try {
            byte[] data = Files.readAllBytes(path);
            HttpHeaders header = new HttpHeaders();
            header.setContentLength(data.length);
            return new HttpEntity<>(data, header);
        }
        catch (Exception e) {
            LOGGER.fine("Could not load the file " + fullFilePath);
            throw new Exception("Could not load the file " + fullFilePath);
        }
    }
}
