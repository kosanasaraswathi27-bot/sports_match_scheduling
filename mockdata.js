// Fictional demo data (used only when CONFIG.MODE = 'demo'). Field names mirror the MySQL columns.
const P=(id,name,team_id,jersey,position)=>({id,name,team_id,jersey,position});
const M=(id,tournament_id,home_id,away_id,venue_id,datetime,status,home_score=null,away_score=null)=>({id,tournament_id,home_id,away_id,venue_id,datetime,status,home_score,away_score});
window.MOCK={
tournaments:[
 {id:1,name:'Premier City League',sport:'Football',start_date:'2026-09-01',end_date:'2026-12-15',status:'Ongoing'},
 {id:2,name:'Inter-College Cricket Cup',sport:'Cricket',start_date:'2026-11-10',end_date:'2026-11-30',status:'Upcoming'},
 {id:3,name:'Summer Hoops Classic',sport:'Basketball',start_date:'2026-05-01',end_date:'2026-06-20',status:'Completed'}],
teams:[
 {id:1,name:'Chennai Strikers',coach:'R. Kumar',city:'Chennai'},{id:2,name:'Madurai Lions',coach:'S. Pillai',city:'Madurai'},
 {id:3,name:'Coimbatore Kings',coach:'A. Raj',city:'Coimbatore'},{id:4,name:'Trichy Titans',coach:'M. Iqbal',city:'Trichy'},
 {id:5,name:'Salem Falcons',coach:'D. Nair',city:'Salem'},{id:6,name:'Vellore Warriors',coach:'K. Das',city:'Vellore'}],
players:[P(1,'Arjun Mehta',1,9,'Forward'),P(2,'Ravi Shankar',1,1,'Goalkeeper'),P(3,'Karthik Iyer',1,6,'Midfielder'),
 P(4,'Vikram Singh',2,10,'Forward'),P(5,'Sanjay Rao',2,4,'Defender'),P(6,'Dev Patel',3,7,'All-rounder'),
 P(7,'Imran Khan',3,11,'Bowler'),P(8,'Naveen Kumar',4,8,'Midfielder'),P(9,'Rahul Das',4,5,'Defender'),
 P(10,'Suresh Babu',5,3,'Batsman'),P(11,'Anil Joseph',5,12,'Guard'),P(12,'Manoj Pandian',6,2,'Guard')],
venues:[{id:1,name:'Marina Arena',city:'Chennai',capacity:25000},{id:2,name:'Madurai Sports Complex',city:'Madurai',capacity:18000},{id:3,name:'Kovai Stadium',city:'Coimbatore',capacity:30000}],
registrations:[
 {id:1,tournament_id:1,team_id:1,reg_date:'2026-08-10'},{id:2,tournament_id:1,team_id:2,reg_date:'2026-08-11'},
 {id:3,tournament_id:1,team_id:3,reg_date:'2026-08-12'},{id:4,tournament_id:1,team_id:4,reg_date:'2026-08-15'},
 {id:5,tournament_id:2,team_id:3,reg_date:'2026-10-01'},{id:6,tournament_id:2,team_id:5,reg_date:'2026-10-02'},{id:7,tournament_id:2,team_id:6,reg_date:'2026-10-03'},
 {id:8,tournament_id:3,team_id:5,reg_date:'2026-04-01'},{id:9,tournament_id:3,team_id:6,reg_date:'2026-04-02'}],
matches:[
 M(1,1,1,2,1,'2026-09-12T18:00','Completed',2,1),M(2,1,3,4,2,'2026-09-13T16:30','Completed',0,0),
 M(3,1,1,3,1,'2026-10-04T18:00','Completed',3,2),M(4,1,2,4,3,'2026-10-25T17:00','Scheduled'),
 M(5,1,4,1,2,'2026-11-08T18:00','Scheduled'),M(6,2,3,5,3,'2026-11-12T10:00','Scheduled'),
 M(7,2,5,6,3,'2026-11-15T10:00','Scheduled'),M(8,3,5,6,1,'2026-05-10T19:00','Completed',78,81),
 M(9,1,3,2,3,'2026-10-18T15:00','Cancelled')]
};
