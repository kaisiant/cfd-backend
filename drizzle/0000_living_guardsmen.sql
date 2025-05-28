CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"type" varchar(20) NOT NULL,
	"side" varchar(10) NOT NULL,
	"volume" numeric(15, 5) NOT NULL,
	"price" numeric(15, 5),
	"stop_loss" numeric(15, 5),
	"take_profit" numeric(15, 5),
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"executed_at" timestamp,
	"cancelled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"side" varchar(10) NOT NULL,
	"volume" numeric(15, 5) NOT NULL,
	"open_price" numeric(15, 5) NOT NULL,
	"current_price" numeric(15, 5),
	"stop_loss" numeric(15, 5),
	"take_profit" numeric(15, 5),
	"swap" numeric(15, 2) DEFAULT '0',
	"commission" numeric(15, 2) DEFAULT '0',
	"pnl" numeric(15, 2) DEFAULT '0',
	"margin" numeric(15, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'open',
	"opened_at" timestamp DEFAULT now(),
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"balance" numeric(15, 2) DEFAULT '0',
	"equity" numeric(15, 2) DEFAULT '0',
	"margin" numeric(15, 2) DEFAULT '0',
	"free_margin" numeric(15, 2) DEFAULT '0',
	"leverage" integer DEFAULT 100,
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;