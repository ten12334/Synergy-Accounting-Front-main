export interface User {
    userid: bigint;
    userType: UserType;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    birthday: Date;
    address: string;
    verificationCode: string;
    isVerified: boolean;
    isActive: boolean;
    joinDate: Date;
    failedLoginAttempts: number;
    tempLeaveStart: Date;
    tempLeaveEnd: Date;
    emailPassword: string;
}

export interface MessageResponse {
    message: string;
}

export interface Account {
    accountName: string;
    accountNumber: number;
    accountDescription: string;
    normalSide: AccountType;
    accountCategory: AccountCategory;
    accountSubCategory: AccountSubCategory;
    initialBalance: number;
    debitBalance: number;
    creditBalance: number;
    currentBalance: number;
    dateAdded: Date;
    creator: User;
}

export interface Email {
    to: string;
    from: string;
    date: string;
    subject: string;
    body: string;
    id: string;
}

export enum AccountType {
    DEBIT = "DEBIT",
    CREDIT = "CREDIT"
}

export enum AccountCategory {
    ASSET = "ASSET",
    LIABILITY = "LIABILITY",
    EQUITY = "EQUITY",
    REVENUE = "REVENUE",
    EXPENSE = "EXPENSE",
}

export enum AccountSubCategory {
    CURRENT = "CURRENT",
    LONGTERM = "LONGTERM",
    OWNERS = "OWNERS",
    SHAREHOLDERS = "SHAREHOLDERS",
    OPERATING = "OPERATING",
    NONOPERATING = "NONOPERATING"
}

export enum UserType {
    DEFAULT = "DEFAULT",
    USER = "USER",
    MANAGER = "MANAGER",
    ADMINISTRATOR = "ADMINISTRATOR"
}