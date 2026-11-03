package demonofgalaxy.project_carsharing;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.scene.Scene;
import javafx.scene.layout.BorderPane;
import javafx.scene.web.WebView;
import javafx.stage.Stage;

public class DesktopLauncher extends Application {

    @Override
    public void start(Stage stage) {
        WebView webView = new WebView();
        // Загружаем наш локальный фронтенд
        webView.getEngine().load("http://localhost:8080/");

        BorderPane root = new BorderPane(webView);
        Scene scene = new Scene(root, 1300, 850);

        stage.setTitle("NEXUS DRIVE — Система управления каршерингом");
        stage.setScene(scene);
        stage.setOnCloseRequest(e -> {
            Platform.exit();
            System.exit(0);
        });
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}