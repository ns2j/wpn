package wpn;
import java.nio.charset.StandardCharsets;

import org.apache.http.Header;
import org.apache.http.HttpResponse;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import nl.martijndwars.webpush.Encoding;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;

public class Push {
    private static Logger logger = LoggerFactory.getLogger(Push.class);

    private PushService pushService;

    public Push(PushService pushService) {
        this.pushService = pushService;
    }
    
    public int sendPush(String endpoint, String publicKey, String authenticationSecret, byte[] payload) {
        try {
            Notification notification = new Notification(endpoint, publicKey, authenticationSecret, payload);

            HttpResponse response = pushService.send(notification, Encoding.AES128GCM);
            logger.info(endpoint);
            logger.info(authenticationSecret);
            logger.info("" + response.getStatusLine());
            logger.info("" + response.getEntity());
            logger.info(EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8));
            for (Header h: response.getAllHeaders()) {
                logger.info("" + h); 
            }
            return response.getStatusLine().getStatusCode(); 
        } catch (Exception exception) {
            logger.error(exception.getMessage());
            return -1;
        }
    }
}

