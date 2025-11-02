package wpn;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import nl.martijndwars.webpush.PushService;
import wpn.WebPushConfig.WebPushProperties;

@RestController
@RequestMapping("/api")
public class ApiController {
    private static Logger logger = LoggerFactory.getLogger(ApiController.class);

    PushService pushService;
    WebPushProperties webPushProperties;
    
    public ApiController(PushService pushService,
            WebPushProperties webPushProperties) {
        this.pushService = pushService;
        this.webPushProperties = webPushProperties;
    }
    
    record PublicKey(
            String publicKey) {}
    
    @GetMapping("/publickey")
    public PublicKey getPublicKey() {
        return new PublicKey(webPushProperties.vapidPublicKey());
    }

    record Keys(
            String p256dh,
            String auth
            ) {} 
    
    record Subscription(
            String endpoint,
            String expireationTime,
            Keys keys) {}
    
    List<Subscription> repo = new ArrayList<>();
    
    @PostMapping("/register")
    public void registerSubsciption(@RequestBody Subscription sub) {
        logger.info("" + sub);
        repo.add(sub);
    }
    
    @PostMapping("/push")
    public void sendPush() throws UnsupportedEncodingException {
        byte[] payload = """
      {
          "title": "Web Push Notification test",
          "body": "Hello world!",
          "vibrate": [100, 50, 100]
      }                        
                        """.getBytes("UTF-8");
  
        Push push = new Push(pushService);
        List<Subscription> removing = new ArrayList<Subscription>();
        repo.forEach(sub -> {
            int code = push.sendPush(sub.endpoint(),
                    sub.keys().p256dh(), 
                    sub.keys().auth(), payload);
            if (code >= 400 && code < 500) {
                repo.stream()
                .filter(r -> r.endpoint().equals(sub.endpoint()))
                .forEach(r -> removing.add(r));
            }
        });
        for (Subscription r: removing)
            repo.remove(r);
        
    }
    
}
