import { prisma } from "../lib/prisma.js"
import { hashPassword } from "../lib/hash.js"

async function main() {
  const email = "dev@example.com"
  const exists = await prisma.user.findUnique({ where: { email } })
  if (!exists) {
    await prisma.user.create({
      data: {
        name: "Dev User",
        email,
        passwordHash: await hashPassword("P@ssw0rd"),
        profileJson: {
          text: "java spring boot rest postgresql",
          skills: ["java", "spring boot", "rest", "postgresql"],
        },
      },
    })
    console.log("Seeded user:", email, "password: P@ssw0rd")
  } else {
    console.log("User already exists:", email)
  }

  await prisma.job.createMany({
    data: [
      {
        source: "dev-seed",
        title: "Java Developer (Fresher)",
        company: "ABC Tech",
        location: "Noida",
        description:
          "We are looking for a Fresher Java developer with knowledge of Java 8, Spring Boot, REST APIs and PostgreSQL. Knowledge of Hibernate is a plus.",
        url: "https://example-company-careers.com/jobs/1234",
      },
      {
        source: "dev-seed",
        title: "Junior Backend Engineer",
        company: "XYZ Labs",
        location: "Remote",
        description: "Backend role with Java/Spring, REST, SQL basics.",
        url: "https://example.com/jobs/789",
      },
    ],
    skipDuplicates: true,
  })

  console.log("Seeded jobs")
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
