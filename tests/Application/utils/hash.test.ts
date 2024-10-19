import { expect } from 'chai'
import { hash, checkHash, generateSalt } from '../../../src/Application/utils/hash'

describe('hash function', () => {
    it('should hash a password with a salt', () => {
        const password = 'password'
        const salt = generateSalt()
        const hashedPassword = hash(password, salt)
        expect(hashedPassword).to.be.a('string')
        expect(hashedPassword).to.not.eq(password)
    })
    it ('should return true if checkHash is called with the same password, salt and hashed password', () => {
        const password = 'password'
        const salt = generateSalt()
        expect(salt).to.be.a('string')
        const hashedPassword = hash(password, salt)
        expect(checkHash(password, salt, hashedPassword)).to.be.true
    })
    it ('should return false if checkHash is called with different password, salt and hashed password', () => {
        const password = 'password'
        const salt = generateSalt()
        const hashedPassword = hash(password, salt)
        expect(checkHash('differentpassword', salt, hashedPassword)).to.be.false
    })
    it('should have different hash for the different passwords', () => {
        const passwordOne = 'passwordOne'
        const passwordTwo = 'passwordTwo'
        const saltOne = generateSalt()
        const saltTwo = generateSalt()
        const hashedPasswordOne = hash(passwordOne, saltOne)
        const hashedPasswordTwo = hash(passwordTwo, saltTwo)
        expect(hashedPasswordOne).to.not.eq(hashedPasswordTwo)
    })
})
