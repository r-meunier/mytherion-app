package io.mytherion.architecture

import com.tngtech.archunit.core.domain.JavaClasses
import com.tngtech.archunit.core.importer.ClassFileImporter
import com.tngtech.archunit.core.importer.ImportOption
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses
import org.junit.jupiter.api.Test

/**
 * Executable guardrails for the package structure.
 *
 * The codebase is organised by domain rather than by layer, and that only survives if it is
 * enforced. These rules fail the build when the boundaries drift, instead of relying on review
 * to catch it.
 */
class PackageStructureTest {

    private val productionClasses: JavaClasses =
        ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages(ROOT)

    // ════════════════════════════════════════════════════════════════
    //  Shared kernel isolation
    // ════════════════════════════════════════════════════════════════

    @Test
    fun `common must not depend on any other mytherion package`() {
        noClasses()
            .that()
            .resideInAPackage("$ROOT.common..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                *(DOMAINS + arrayOf("$ROOT.platform..", "$ROOT.config.."))
            )
            .because(
                "common is the shared kernel: everything may depend on it, it depends on nothing"
            )
            .check(productionClasses)
    }

    @Test
    fun `platform must not depend on business domains`() {
        noClasses()
            .that()
            .resideInAPackage("$ROOT.platform..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(*DOMAINS)
            .because(
                "platform is infrastructure (email, storage, logging, monitoring, health); " +
                    "domains build on it, not the other way around"
            )
            .check(productionClasses)
    }

    // ════════════════════════════════════════════════════════════════
    //  Layer placement within a domain
    // ════════════════════════════════════════════════════════════════

    @Test
    fun `domain controllers must live in a rest package`() {
        classes()
            .that()
            .areAnnotatedWith("org.springframework.web.bind.annotation.RestController")
            .and()
            .resideInAnyPackage(*DOMAINS)
            .should()
            .resideInAPackage("..rest..")
            .because(
                "the HTTP layer is named rest/ in every domain; platform.health is deliberately " +
                    "exempt, since a single infrastructure endpoint does not warrant its own " +
                    "rest/ package"
            )
            .check(productionClasses)
    }

    @Test
    fun `spring data repositories must live in a repository package`() {
        classes()
            .that()
            .areAssignableTo("org.springframework.data.repository.Repository")
            .and()
            .areNotAnnotatedWith("java.lang.annotation.Annotation")
            .should()
            .resideInAPackage("..repository..")
            .because("persistence belongs in each domain's repository/ package")
            .check(productionClasses)
    }

    @Test
    fun `persistence models must not depend on the web layer`() {
        noClasses()
            .that()
            .resideInAPackage("..model..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage("..rest..", "..dto..")
            .because("JPA models must not be shaped by the transport layer")
            .check(productionClasses)
    }

    // ════════════════════════════════════════════════════════════════
    //  Exception handling contract
    // ════════════════════════════════════════════════════════════════

    @Test
    fun `the global exception handler must not depend on any domain`() {
        noClasses()
            .that()
            .resideInAPackage("$ROOT.config.web..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(*DOMAINS)
            .because(
                "client-facing domain errors extend common.exception.ApiException and carry " +
                    "their own status, so adding a domain must not require editing shared code"
            )
            .check(productionClasses)
    }

    private companion object {
        const val ROOT = "io.mytherion"

        val DOMAINS = arrayOf(
            "$ROOT.user..",
            "$ROOT.project..",
            "$ROOT.entity..",
            "$ROOT.category..",
            "$ROOT.dashboard..",
            "$ROOT.auth.."
        )
    }
}
