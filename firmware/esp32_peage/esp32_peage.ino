/*
 * ====================================================================================
 *   Système de Péage Électronique ESP32 - Code Firmware Arduino C++
 *   Auteur : Mourchid FOLARIN
 * ====================================================================================
 * 
 * BIBLIOTHÈQUES À INSTALLER DANS L'IDE ARDUINO :
 * 1. MFRC522 (par githubmeme / miguelbalboa) -> Gestion du lecteur RFID RC522
 * 2. ESP32Servo (par Kevin Harrington) -> Contrôle du Servomoteur sur ESP32
 * 3. LiquidCrystal_I2C (par Frank de Brabander) -> Écran LCD 16x2 I2C
 * 4. ArduinoJson (par Benoit Blanchon - version 6 ou 7) -> Parsing du JSON HTTP
 * 
 * SCHÉMA DE CÂBLAGE ESP32 :
 * ------------------------------------------------------------------------------------
 * Composant      | Broche Composant | Broche ESP32
 * ------------------------------------------------------------------------------------
 * RFID RC522     | SDA (SS)         | GPIO 5
 *                | SCK              | GPIO 18
 *                | MOSI             | GPIO 23
 *                | MISO             | GPIO 19
 *                | RST              | GPIO 4
 *                | 3.3V             | 3.3V (ATTENTION : Ne PAS connecter au 5V !)
 *                | GND              | GND
 * ------------------------------------------------------------------------------------
 * Servomoteur    | Signal (Jaune/Or)| GPIO 13
 * SG90 / MG996R  | VCC (Rouge)      | 5V (Alimentation externe recommandée)
 *                | GND (Marron/Noir)| GND
 * ------------------------------------------------------------------------------------
 * Écran LCD I2C  | SDA              | GPIO 21
 * (16x2)         | SCL              | GPIO 22
 *                | VCC              | 5V
 *                | GND              | GND
 * ------------------------------------------------------------------------------------
 * Indication     | LED Verte (Anode)| GPIO 12 (avec résistance 220Ω)
 *                | LED Rouge (Anode)| GPIO 14 (avec résistance 220Ω)
 *                | Buzzer (+)       | GPIO 27
 * ====================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

// ====================================================================================
// 1. CONFIGURATION DU RÉSEAU ET DE L'API REST (RENDER)
// ====================================================================================
const char* WIFI_SSID     = "VOTRE_NOM_WIFI";       // Remplacer par le SSID de votre réseau Wi-Fi
const char* WIFI_PASSWORD = "VOTRE_MOT_DE_PASSE";   // Remplacer par le mot de passe Wi-Fi

// URL de l'API déployée sur Render (ou adresse IP locale ex: "http://192.168.1.50:5000/api/toll/scan")
const char* API_URL       = "https://peage-backend.onrender.com/api/toll/scan";

// Identifiant unique du poste de péage (optionnel, défini dans Prisma seed)
const char* TOLL_GATE_ID  = "00000000-0000-0000-0000-000000000001";

// ====================================================================================
// 2. DÉFINITION DES BROCHES (GPIO PINS)
// ====================================================================================
#define RFID_SS_PIN   5
#define RFID_RST_PIN  4

#define SERVO_PIN     13

#define LED_GREEN_PIN 12
#define LED_RED_PIN   14
#define BUZZER_PIN    27

// ====================================================================================
// 3. INITIALISATION DES OBJETS MATÉRIELS
// ====================================================================================
MFRC522 rfid(RFID_SS_PIN, RFID_RST_PIN);
Servo barrierServo;
LiquidCrystal_I2C lcd(0x27, 16, 2); // Adresse I2C 0x27 ou 0x3F

// Angles de la barrière
const int BARRIER_CLOSED_ANGLE = 0;   // Barrière fermée (horizontale)
const int BARRIER_OPEN_ANGLE   = 90;  // Barrière ouverte (verticale)

// ====================================================================================
// SETUP (INITIALISATION DU SYSTÈME)
// ====================================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==========================================");
  Serial.println("   DÉMARRAGE DU SYSTÈME DE PÉAGE ESP32    ");
  Serial.println("==========================================");

  // Configuration des broches d'E/S
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(LED_GREEN_PIN, LOW);
  digitalWrite(LED_RED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  // Initialisation de l'écran LCD I2C
  Wire.begin(21, 22); // SDA = GPIO 21, SCL = GPIO 22
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Peage Electroniq");
  lcd.setCursor(0, 1);
  lcd.print("Initialisation..");

  // Initialisation du Servomoteur
  ESP32PWM::allocateTimer(0);
  barrierServo.setPeriodHertz(50); // Standard 50Hz servo
  barrierServo.attach(SERVO_PIN, 500, 2400);
  closeBarrier();

  // Initialisation du bus SPI et du lecteur RFID MFRC522
  SPI.begin(18, 19, 23, 5); // SCK, MISO, MOSI, SS
  rfid.PCD_Init();
  Serial.println("✅ Lecteur RFID MFRC522 prêt.");

  // Connexion au Wi-Fi
  connectToWiFi();

  // Écran d'accueil prêt
  showStandbyScreen();
}

// ====================================================================================
// LOOP (BOUCLE PRINCIPALE DE DÉTECTION)
// ====================================================================================
void loop() {
  // Maintenir la connexion Wi-Fi active
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  // Vérifier si une nouvelle carte RFID est présente devant le lecteur
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  // Lire l'identifiant (UID) de la carte
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  // Convertir le tableau d'octets UID en chaîne de caractères Hexadécimale (ex: "A1B2C3D4")
  String cardUid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      cardUid += "0";
    }
    cardUid += String(rfid.uid.uidByte[i], HEX);
  }
  cardUid.toUpperCase();

  Serial.println("\n------------------------------------------");
  Serial.print("💳 Carte RFID détectée ! UID: ");
  Serial.println(cardUid);

  // Signaler visuellement et à l'écran la prise en compte du scan
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Carte detectee!");
  lcd.setCursor(0, 1);
  lcd.print("Verification...");
  playBeep(50, 1);

  // Envoyer la requête HTTP POST à l'API backend
  processCardScan(cardUid);

  // Stopper la lecture de la carte actuelle
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  // Retourner à l'écran de veille après le traitement
  delay(1500);
  showStandbyScreen();
}

// ====================================================================================
// FONCTIONS HTTP & LOGIQUE DE TRAITEMENT PÉAGE
// ====================================================================================

/**
 * Envoie l'UID scanné à l'API REST Node.js/Express
 */
void processCardScan(String cardUid) {
  HTTPClient http;

  Serial.print("📡 Envoi vers ");
  Serial.println(API_URL);

  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");

  // Construction du corps JSON de la requête
  StaticJsonDocument<200> reqDoc;
  reqDoc["card_uid"] = cardUid;
  reqDoc["toll_gate_id"] = TOLL_GATE_ID;

  String jsonPayload;
  serializeJson(reqDoc, jsonPayload);

  // Exécution du POST HTTP
  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    String responseString = http.getString();
    Serial.print("HTTP Status Code: ");
    Serial.println(httpResponseCode);
    Serial.print("Reponse API: ");
    Serial.println(responseString);

    // Parsing du JSON de réponse
    StaticJsonDocument<512> resDoc;
    DeserializationError error = deserializeJson(resDoc, responseString);

    if (!error) {
      const char* status = resDoc["status"] | "error";
      const char* userName = resDoc["user_name"] | "Usager";
      const char* message = resDoc["message"] | "";
      float remainingBalance = resDoc["remaining_balance"] | 0.0;

      if (String(status) == "authorized") {
        handleAuthorizedPass(userName, remainingBalance);
      } else {
        handleRefusedPass(message);
      }

    } else {
      Serial.print("❌ Erreur de parsing JSON: ");
      Serial.println(error.c_str());
      handleErrorPass("Erreur Reponse");
    }

  } else {
    Serial.print("❌ Erreur de connexion HTTP: ");
    Serial.println(http.errorToString(httpResponseCode));
    handleErrorPass("Erreur Connexion");
  }

  http.end();
}

/**
 * Traitement en cas d'accès AUTORISÉ
 */
void handleAuthorizedPass(const char* userName, float balance) {
  Serial.println("🟢 ACCÈS AUTORISÉ ! Ouverture de la barrière.");

  // LED Verte & Beep de succès
  digitalWrite(LED_GREEN_PIN, HIGH);
  playBeep(80, 2);

  // Affichage LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("PASSEZ S.V.P !");
  lcd.setCursor(0, 1);
  lcd.print("Solde: ");
  lcd.print((int)balance);
  lcd.print(" FCFA");

  // Ouverture de la barrière
  openBarrier();

  // Maintenir la barrière ouverte pendant 4 secondes pour laisser passer le véhicule
  delay(4000);

  // Fermeture de la barrière
  closeBarrier();

  digitalWrite(LED_GREEN_PIN, LOW);
}

/**
 * Traitement en cas d'accès REFUSÉ (Solde insuffisant, carte bloquée ou inconnue)
 */
void handleRefusedPass(const char* reasonMessage) {
  Serial.print("🔴 ACCÈS REFUSÉ ! Raison: ");
  Serial.println(reasonMessage);

  // LED Rouge & Long Beep d'erreur
  digitalWrite(LED_RED_PIN, HIGH);
  playLongBeep();

  // Affichage LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("ACCES REFUSE !");
  lcd.setCursor(0, 1);
  
  // Raccourcir le message pour le LCD 16 caractères
  String msgStr = String(reasonMessage);
  if (msgStr.length() > 16) {
    msgStr = msgStr.substring(0, 16);
  }
  lcd.print(msgStr);

  // La barrière reste fermée
  closeBarrier();

  delay(3500);

  digitalWrite(LED_RED_PIN, LOW);
}

/**
 * Traitement des erreurs système / réseau
 */
void handleErrorPass(const char* errorText) {
  digitalWrite(LED_RED_PIN, HIGH);
  playLongBeep();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("ERREUR SYSTEME");
  lcd.setCursor(0, 1);
  lcd.print(errorText);

  delay(3000);
  digitalWrite(LED_RED_PIN, LOW);
}

// ====================================================================================
// FONCTIONS AUXILIAIRES MATÉRIELLES (BARRIÈRE & I/O)
// ====================================================================================

void openBarrier() {
  barrierServo.write(BARRIER_OPEN_ANGLE);
}

void closeBarrier() {
  barrierServo.write(BARRIER_CLOSED_ANGLE);
}

void showStandbyScreen() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("  PEAGE EXPRESS ");
  lcd.setCursor(0, 1);
  lcd.print("Scannez la carte");
}

void connectToWiFi() {
  Serial.print("📶 Connexion au réseau Wi-Fi: ");
  Serial.println(WIFI_SSID);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connexion WiFi..");
  lcd.setCursor(0, 1);
  lcd.print(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Connexion Wi-Fi réussie !");
    Serial.print("Adresse IP ESP32: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Échec de connexion Wi-Fi. Mode hors-ligne / réessai...");
  }
}

void playBeep(int durationMs, int count) {
  for (int i = 0; i < count; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(durationMs);
    digitalWrite(BUZZER_PIN, LOW);
    if (count > 1) delay(50);
  }
}

void playLongBeep() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(600);
  digitalWrite(BUZZER_PIN, LOW);
}
