import {User} from "../../../src/features/users/domain/user.entity";
import {initApp} from "../../../src/initApp";
import {db} from "../../../src/ioc";
import {appConfig} from "../../../src/common/settings/config";


describe(`<<mock>> TESTING!!!`, ()=>{


    it('должен использовать мокированный setRegConfirmationCode', async () => {

        const mockCode = '123';

        const mockDate = new Date();

// Создаем экземпляр пользователя

        const user = User.createUserByReg({ login: 'test', email: 'test@test.com', hash: 'hash' });

// Мокируем метод экземпляра

        // jest.spyOn(user, 'setRegConfirmationCode').mockImplementation(function(code, date) {
        //
        //     this.emailConfirmation = {
        //
        //         confirmationCode: mockCode,
        //
        //         expirationDate: mockDate,
        //
        //     };
        //
        // });

// Вызываем метод, который использует setRegConfirmationCode

        //user.setRegConfirmationCode('anyCode', new Date());

// Проверяем, что установлены мокированные значения

 //       expect(user.emailConfirmation?.confirmationCode).toBe(mockCode);

   //     expect(user.emailConfirmation?.expirationDate).toBe(mockDate);

    });
})

