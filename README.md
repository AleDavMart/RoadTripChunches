# RoadTripChunches
A web site to buy snacks and random stuff on a virtual roadtrip. 
Chunches in spanish means things that you like but dont have an inherent value or purpose. 
This could be a figurine, or small trinckets that you cherish but do not need. 
I was inspired to build this market place because I love to go on roadtrips and gather 
small souvenirs of the places I have visited.

###UML Diagram: 


### Adyen's Test Cards for Payment: 
https://docs.adyen.com/development-resources/test-cards/test-card-numbers

CREATE TABLE sales(
PSP_Reference VARCHAR NOT NULL PRIMARY KEY,
total INT NOT NULL,
items_sold INT NOT NULL,
)