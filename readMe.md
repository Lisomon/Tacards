# ReadMe für Tacards #

## Info ##

Bei steigender Sehnsucht nach ein paar Partien des Gesellschaftsspiels __TAC__ (__shop.spiel-tac.de__) während des Corona-Lockdowns, entstand die große Motivation für die Arbeit an einer virtuellen Alternative. 

Die Idee war, sofern jeder Beteiligte ein Spielbrett zur Verfügung hätte, müsste nur eine Lösung für die Verwaltung der Karten als Software umgesetzt werden.

Was als kleiner, gerade so spielbare Chat-Bot startete, entwickelte sich über einige grafische und funktionale Erweiterungen bis nun jetzt zu einer fertigen Webanwendung.

Erreichbar ist die Online-Kartenverwaltung unter tacards.spieltac.de.

An dieser Stelle möchten wir uns bei den Erfindern von TAC bedanken, von deren Seite wir motiviert und bestärkt wurden. Außerdem bedanken wir uns für das Vertrauen und die Erlaubnis ihren Namen und Grafiken zu verwenden.

## Nutzung ##

Für die Nutzung wird neben einem Gerät mit Internetzugang und einen Browser für jeden Spieler auch ein Spielbrett für jeden Ort an dem sich Spieler befinden benötigt.

Alternativ kann auch eine weitere digitale Umsetzung verwendet werden, wobei allerdings ein großer oder zwei Displays zu empfehlen sind. Beispiele hierfür sind Tabletop-Simulator und diese von uns unabhängige Lösung www.tac-brett.de.


## Weiterentwicklung ##

Eine Weiterentwicklung ist von uns nicht geplant. Falls jemand einen Fehler entdeckt, eine Idee für ein kleines cooles Feature hat oder dieses vielleicht sogar selber schreiben will kann man uns gerne kontaktieren. (__pm.greisch@gmail.com__)


## Verwendung ##

Für den Fall, dass jemand den Code oder Teile davon verwenden will, hier eine kleine Anleitung.

Aus rechtlichen Gründen laden wir das Bildmaterial nicht hoch.

###  Voraussetzung ###

* Git installiert
* Node.js installiert

### Installation ###

1. Konsole im gewünschten Ordner öffnen

1. `git clone https://gitlab.com/Aldamon/tacbot.git`

1. `npm install`

### Starten ###

#### Lokal ####

1. Konsole im gewünschten Ordner öffnen

1. `npm run dev`

1. Im Browser http://localhost:8080 aufrufen (__NICHT INTERNET EXPLORER__ )

#### Server ####

Beachten: Hierfür werden im Überordner nach SSL-Zertifikaten gesucht

1. Konsole im gewünschten Ordner öffnen

1. `npm start`

1. Im Browser http://domain:8080 aufrufen oder gleich https (__NICHT INTERNET EXPLORER__ )


