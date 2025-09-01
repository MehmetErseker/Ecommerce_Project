using AutoMapper;
using Business.Abstract;
using Business.Constants;
using Core.Entities.Concrete;
using Core.Utilities.Results;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework;
using Entities.Concrete;
using Entities.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Business.Concrete
{
    public class UserManager : IUserService
    {
        private readonly IUserDal _userDal;
        private readonly IMapper _mapper;

        public UserManager(IUserDal userDal, IMapper mapper)
        {
            _userDal = userDal;
            _mapper = mapper;
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
            var data = await _userDal.GetAll(p => !p.isDeleted);
            return new SuccessDataResult<List<User>>(data, Messages.UsersListed);
        }

        public async Task<IDataResult<List<User>>> GetAllUsers()
        {
            var data = await _userDal.GetAll();
            return new SuccessDataResult<List<User>>(data, Messages.AllUsersListed);
        }

        public async Task<IDataResult<UserDto>> GetById(int userId)
        {
            var user = await _userDal.Get(u => u.Id == userId && !u.isDeleted);
            var userDto = _mapper.Map<UserDto>(user);

            if (user == null)
            {
                return new ErrorDataResult<UserDto>(Messages.UserNotFound);
            }

            return new SuccessDataResult<UserDto>(userDto, Messages.AllUsersListed);
        }

        //public async Task<IDataResult<List<OperationClaim>>> GetClaims(User user)
        //{
        //    var claims = await _userDal.GetClaims(user);
        //    if (claims == null || claims.Count == 0)
        //    {
        //        return new ErrorDataResult<List<OperationClaim>>(Messages.NoClaimsFound);
        //    }
        //    return new SuccessDataResult<List<OperationClaim>>(claims, Messages.ClaimsListed);
        //}

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

        public async Task<IDataResult<User>> GetByMail(string email)
        {

            var user = await _userDal.GetByMail(email);
            if (user == null)
            {
                return new ErrorDataResult<User>(Messages.UserNotFound);
            }
            return new SuccessDataResult<User>(user);

        }

        public async Task<List<OperationClaim>> GetClaims(User user)
        {
            return _userDal.GetClaims(user);
        }

    }
}
