import { Api } from "./api";

export const UserService = {

  getAll() {
    return Api.get("/users");
  },

  getById(id: string) {
    return Api.get(`/users/${id}`);
  },

  update(id: string, dto: Record<string, unknown>) {
    return Api.patch(
      `/users/${id}`,
      dto
    );
  },

  delete(id: string) {
    return Api.delete(
      `/users/${id}`
    );
  },
};
