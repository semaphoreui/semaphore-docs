---
title: Hosts
description: Die Administratoransicht der Hosts aller Projekte, die Nodes-Zählung der Lizenz und wie Sie einen Host außer Betrieb nehmen, den Sie nicht mehr verwalten.
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

Die Administratorseite **Hosts** listet die Hosts aller Projekte an einer Stelle auf und zeigt, welche
von ihnen auf die **Nodes** Ihrer Lizenz angerechnet werden. Öffnen Sie das Admin-Menü unten links
und wählen Sie **Hosts**.

Wie Hosts in die Liste gelangen, die Status, die Suche und die Host-Karte sind dieselben wie auf der
Projektseite. Weitere Informationen finden Sie unter [Hosts](/user-guide/hosts). Hier ist ein Host
eine Zeile für alle Projekte, und seine Karte listet die Projekte und die Tasks auf, die ihn erreicht
haben.

## Lizenzzählung {#license-count}

Ihre Lizenz enthält eine Anzahl von Hosts. Die Zeile **Nodes** unter **Abonnement & Abrechnung** zeigt,
wie viele in Verwendung sind, zum Beispiel `42 / 50`. Ein Host ist in Verwendung, wenn ihn ein
Ansible-Task im letzten Monat erreicht hat und ihn niemand außer Betrieb genommen hat. Ein Host, der
immer nur nicht erreichbar war, ist nicht in Verwendung.

Hosts, die nicht in Verwendung sind, zeigen in der Liste **Not counted**. Sie werden von selbst
wieder mitgezählt, sobald sie ein Task das nächste Mal erreicht.

Sind mehr Hosts in Verwendung, als die Lizenz enthält, wird die Zeile **Nodes** rot mit
**(limit exceeded)**, und diese Seite zeigt eine Warnung. Nehmen Sie die Hosts außer Betrieb, die Sie
nicht mehr verwalten, oder erweitern Sie Ihre Lizenz. Weitere Informationen finden Sie unter
[Lizenzaktivierung](/admin-guide/license).

## Einen Host außer Betrieb nehmen {#decommission}

Wenn Sie einen Host aus Ihrer Infrastruktur entfernt haben, klicken Sie am Ende seiner Zeile auf
**Decommission** und bestätigen Sie. Der Host fällt sofort aus der Zählung, zeigt **Decommissioned**
und behält seinen Verlauf in jedem Projekt. Erreicht ihn später erneut ein Task, entfernt Semaphore
die Markierung, und der Host ist wieder in Verwendung.

## Wie geht es weiter {#whats-next}

- [Hosts](/user-guide/hosts) — die Projektseite, die Status und die Host-Karte.
- [Lizenzaktivierung](/admin-guide/license) — den Lizenzschlüssel aktivieren und ersetzen.
