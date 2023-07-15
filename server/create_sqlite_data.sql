BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"email"	TEXT,
	"name"	TEXT,
	"salt"	TEXT,
	"password"	TEXT,
	"role"	TEXT
);
CREATE TABLE IF NOT EXISTS "pages" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"title"	TEXT,
	"createdDate"	DATE,
	"publicationDate" DATE,
	"authorId" INTEGER
);
CREATE TABLE IF NOT EXISTS "contents" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"type"	TEXT,
	"content"	TEXT,
	"position"	INTEGER,
	"pageId" INTEGER
);
CREATE TABLE IF NOT EXISTS "site" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"text" TEXT
);

INSERT INTO "users" VALUES (1,'alighieri@test.com','Dante', 'nd9rh03hc8rh93n8', 'aaeea14fb66ebf6c28843969ac0be5701fec68b16c99dd4b52752b153b5cc4eb','user'); /* password='polito' */
INSERT INTO "users" VALUES (2,'manzoni@test.com','Alessandro',   'be95h0cveubopx6h', 'c359fc73caee06dc024e7e9d42aae80e12508ed901366f7fecbdde989d6ee679','user');
INSERT INTO "users" VALUES (3,'verga@test.com','Giovanni',   'be0snuc8t9nox084', '0fac0bc83d493ff40de1d76ab6eed653df957fb1a5355ae37132f2dae5b1b8dc','user');
INSERT INTO "users" VALUES (4,'Wilde@test.com','Oscar',   'iebc80rba8fnc8e9', '4996e43fbac88019f1ce11c39669b07e4781b7f8ad5277c8b08545fd575dd50c','user');
INSERT INTO "users" VALUES (5,'kafka@test.com','Franz',   'iebc80rba8bs98e9', '22cb685bd0781b11384f4a1e4d621da3840760499c17deb480983d480ab851a9','admin');
INSERT INTO "pages" VALUES (1,'Divina commedia','2023-01-01','2023-01-10',1);
INSERT INTO "pages" VALUES (2,'I promessi sposi ','2023-01-02','2023-09-11',2);
INSERT INTO "pages" VALUES (3,'Malavoglia','2023-01-03', NULL,3);
INSERT INTO "pages" VALUES (4,'Decameron', '2023-01-04','2023-01-13',5);
INSERT INTO "pages" VALUES (5,'Vita nuova', '2023-01-05','2023-10-14',1);
INSERT INTO "pages" VALUES (6,'La metamorfosi', '2023-01-06',NULL,5);
INSERT INTO "contents" VALUES (1,'image', 'Mountain.jpg', 0,1);
INSERT INTO "contents" VALUES (2,'header', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem', 1,1);
INSERT INTO "contents" VALUES (3,'header', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem', 0,2);
INSERT INTO "contents" VALUES (4,'paragraph', 'At vero eos et accusamus et iusto odio dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et quas molestias excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet, ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat', 1,2);
INSERT INTO "contents" VALUES (5,'image', 'Forest.jpg', 2,2);
INSERT INTO "contents" VALUES (6,'header', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium', 0,3);
INSERT INTO "contents" VALUES (7,'image', 'Desert.jpg', 1,3);
INSERT INTO "contents" VALUES (8,'header', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium', 0,4);
INSERT INTO "contents" VALUES (9,'paragraph', 'At vero eos et accusamus et iusto odio dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et quas molestias excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet, ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat', 1,4);
INSERT INTO "contents" VALUES (10,'header', 'eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis', 0,5);
INSERT INTO "contents" VALUES (11,'image', 'Aurora.jpg', 1,5);
INSERT INTO "contents" VALUES (12,'header', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem', 0,6);
INSERT INTO "contents" VALUES (13,'paragraph', 'At vero eos et accusamus et iusto odio dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et quas molestias excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet, ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat', 1,6);
INSERT INTO "contents" VALUES (14,'image', 'Forest.jpg', 2,6);
INSERT INTO "site" VALUES (1,'CMSmall');
COMMIT;
