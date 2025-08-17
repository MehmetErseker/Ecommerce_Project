using Business.Abstract;
using Business.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class UserManager : IUserService
    {
        private readonly IUserDal _userDal;

        public UserManager(IUserDal userDal)
        {
            _userDal = userDal;
        }

        public async Task<IResult> Add(User user)
        {
            await _userDal.Add(user);
            return new SuccessResult(Messages.UserAdded);
        }

        public async Task<IResult> Delete(int UserId)
        {
            var entity = await _userDal.Get(u => u.Id == UserId);
            if (entity == null)
            {
                return new ErrorResult(Messages.UserNotFound);
            }

            entity.isDeleted = true;
            await _userDal.Update(entity);
            return new SuccessResult(Messages.UserDeleted);
        }

        // exclude deleted users
        public async Task<IDataResult<List<User>>> GetAll()
        {
            var data = await _userDal.GetAllWithAddresses(p => !p.isDeleted);
            return new SuccessDataResult<List<User>>(data, Messages.UsersListed);
        }

        public async Task<IDataResult<List<User>>> GetAllUsers()
        {
            var data = await _userDal.GetAllWithAddresses();
            return new SuccessDataResult<List<User>>(data, Messages.AllUsersListed);
        }

        public async Task<IResult> HardDelete(int UserId)
        {
            var entity = await _userDal.Get(u => u.Id == UserId);
            if (entity == null)
            {
                return new ErrorResult(Messages.UserNotFound);
            }

            await _userDal.Delete(entity);
            return new SuccessResult(Messages.UserDeleted);
        }

        public async Task<IResult> Update(User user)
        {
            await _userDal.Update(user);
            return new SuccessResult(Messages.UserUpdated);
        }
    }
}
