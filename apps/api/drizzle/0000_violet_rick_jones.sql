CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" varchar(512) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "schools_rating_range" CHECK ("schools"."rating" >= 1.0 AND "schools"."rating" <= 5.0),
	CONSTRAINT "schools_latitude_range" CHECK ("schools"."latitude" >= -90 AND "schools"."latitude" <= 90),
	CONSTRAINT "schools_longitude_range" CHECK ("schools"."longitude" >= -180 AND "schools"."longitude" <= 180)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(64) NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
