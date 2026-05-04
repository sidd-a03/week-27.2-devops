-- CreateIndex
CREATE INDEX "User_email_idx" ON "User" USING HASH ("email");
