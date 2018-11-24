export enum Capability {
    View = 1,
    Edit,
    Create,
    Delete
}

enum RoleTitle {
    Member = 1,
    Staff,
    Admin,
    Manager
}

export class Role {
    static allRoles: Map<number, Role>

    readonly id: number

    readonly title: RoleTitle

    readonly capabilities: Map<number, Capability>

    constructor(title: RoleTitle, capabilities: Capability[]) {
        this.id = title.valueOf()

        this.title = title

        const capabilitiesMap = new Map<number, Capability>()

        capabilities.forEach((capability) => {
            capabilitiesMap.set(capability.valueOf(), capability)
        })

        this.capabilities = capabilitiesMap

        Role.allRoles.set(this.id, this)
    }

    static findByRoleId (role_id: number) {
        const role = Role.allRoles.get(role_id)

        if (!role) {
            throw new Error('not found')
        }

        return role
    }
}

Role.allRoles = new Map<number, Role>()

export const memberRole = new Role(
    RoleTitle.Member, []
)

export const staffRole = new Role(
    RoleTitle.Staff, [Capability.View]
)

export const adminRole = new Role(
    RoleTitle.Admin, 
    [
        Capability.View,
        Capability.Edit,
        Capability.Create
    ]
)

export const managerRole = new Role(
    RoleTitle.Manager, 
    [
        Capability.View,
        Capability.Edit,
        Capability.Create,
        Capability.Delete
    ]
)