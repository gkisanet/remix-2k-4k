## Remix의 장점 요약 -> Progressive enhancement

## 초기
- routes/index.tsx -> 초기페이지
- root.tsx 에는 <Outlet />
- jokes.tsx 에 <Outlet /> -> head UI
- jokes/index.tsx  -> joke 보여주는 component
- jokes/new.tsx -> 폼 엘레먼트
- jokes/$jokeId  -> Parameterized Routes

## Styling
- routes/index.tsx 초기 페이지 스타일링
- root.tsx  의 head에 Links 넣어서 global style 적용
  
## jokes ui 레이아웃
  ```javascript
<div className="jokes-layout">
    <header className="jokes-header">
        <div className="container">
    <main className="jokes-main"> 
        <div className="container">
            <div className="jokes-list">
            <div className="jokes-outlet">
  ```

-  container라는건 flex로 구성하겠다 임...

```css
.container,
.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
```

## prisma/seed.ts
- function seed() { getJokes => db.joke.create}
- function getJokes () { return 가짜 데이터 json}

## prisma Joke 모델링 추가

## 서버상태를 리빌딩할때도 메모리에 저장하게 하기
- singleton.server.ts & db.server.ts 추가

## jokes.tsx에 데이터 로드
```javascript
import { useLoaderData } from "@remix-run/react";
export const loader = async () => {
  return json({
    jokeListItems: await db.joke.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
      take: 5,
    }),
  });
};

export default function JokesRoute() {
  const data = useLoaderData<typeof loader>();

  <ul>
    {data.jokeListItems.map(({ id, name }) => (
      <li key={id}>
        <Link to={id}>{name}</Link>
      </li>
    ))}
  </ul>
```

## jokes/$jokeId.tsx
```javascript
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { db } from "~/utils/db.server";

export const loader = async ({ params }: LoaderArgs) => {
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Error("Joke not found");
  }
  return json({ joke });
};

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{data.joke.content}</p>
      <Link to=".">"{data.joke.name}" Permalink</Link>
    </div>
  );
}
```
- Link to={id} 로 페이지 보내고, 해당 id를 params로 받아 db 조회 

## form post 로 Mutation jokes/new.tsx
```javascript
import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { db } from "~/utils/db.server";

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const content = form.get("content");
  const name = form.get("name");
  // we do this type check to be extra sure and to make TypeScript happy
  // we'll explore validation next!
  if (
    typeof content !== "string" ||
    typeof name !== "string"
  ) {
    throw new Error("Form not submitted correctly.");
  }

  const fields = { content, name };

  const joke = await db.joke.create({ data: fields });
  return redirect(`/jokes/${joke.id}`);
};
```
- redirect 유틸리티 사용법

## jokes/index.tsx
- const [randomJoke] = await db.joke.findMany({
- 랜덤 조크 로드 추가

## jokes/new.tsx  validation, custom response 객체 만들기
- validation function (name, content)
- 입력값 타입 검사 및 오류시 return badRequest
- aria role / properites / states

```javascript
    <input
        defaultValue={actionData?.fields?.name}
        name="name"
        type="text"
        aria-invalid={Boolean(         // Boolean으로 처리
          actionData?.fieldErrors?.name
        )}
        aria-errormessage={
          actionData?.fieldErrors?.name
            ? "name-error"
            : undefined
        }
      />
```
- aria-invalid & aria-errormessage & role 을 같이 쓴다.

## utils/request.server.ts
- http status를 반환하는 helper function   // 제네릭에 대한 이해필요..


## Authentication
- 모델링 변경
  - User  /  Joke에 User와 relationship

## Auth Flow 
- password 해쉬화 를 위한 bcryptjs 설치
  
## login 컴포넌트 추가
- login.tsx / login.css 추가
  
```javascript 
import type { LinksFunction } from "@remix-run/node";
import { Link, useSearchParams } from "@remix-run/react";

import stylesUrl from "~/styles/login.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export default function Login() {
  const [searchParams] = useSearchParams();
  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
        <form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset>
            <legend className="sr-only">
              Login or Register?
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked
              />{" "}
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
              />{" "}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
            />
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              type="password"
            />
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/jokes">Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
```
- useSearchParams로 redirectTo 쿼리파라미터를 가져와 hidden input에 집어넣기


## login.tsx 에 validation추가하기.
  - usename/password/url validation
  - action 함수 추가하기
```javascript
import type {
  ActionFunctionArgs,
  LinksFunction,
} from "@remix-run/node";
import {
  Link,
  useActionData,
  useSearchParams,
} from "@remix-run/react";

import stylesUrl from "~/styles/login.css";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

function validateUsername(username: string) {
  if (username.length < 3) {
    return "Usernames must be at least 3 characters long";
  }
}

function validatePassword(password: string) {
  if (password.length < 6) {
    return "Passwords must be at least 6 characters long";
  }
}

function validateUrl(url: string) {
  const urls = ["/jokes", "/", "https://remix.run"];
  if (urls.includes(url)) {
    return url;
  }
  return "/jokes";
}

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  const loginType = form.get("loginType");
  const password = form.get("password");
  const username = form.get("username");
  const redirectTo = validateUrl(
    (form.get("redirectTo") as string) || "/jokes"
  );
  if (
    typeof loginType !== "string" ||
    typeof password !== "string" ||
    typeof username !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  const fields = { loginType, password, username };
  const fieldErrors = {
    password: validatePassword(password),
    username: validateUsername(username),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  switch (loginType) {
    case "login": {
      // login to get the user
      // if there's no user, return the fields and a formError
      // if there is a user, create their session and redirect to /jokes
      return badRequest({
        fieldErrors: null,
        fields,
        formError: "Not implemented",
      });
    }
    case "register": {
      const userExists = await db.user.findFirst({
        where: { username },
      });
      if (userExists) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: `User with username ${username} already exists`,
        });
      }
      // create the user
      // create their session and redirect to /jokes
      return badRequest({
        fieldErrors: null,
        fields,
        formError: "Not implemented",
      });
    }
    default: {
      return badRequest({
        fieldErrors: null,
        fields,
        formError: "Login type invalid",
      });
    }
  }
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
        <form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset>
            <legend className="sr-only">
              Login or Register?
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === "login"
                }
              />{" "}
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
                defaultChecked={
                  actionData?.fields?.loginType ===
                  "register"
                }
              />{" "}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(
                actionData?.fieldErrors?.username
              )}
              aria-errormessage={
                actionData?.fieldErrors?.username
                  ? "username-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className="form-validation-error"
                role="alert"
                id="username-error"
              >
                {actionData.fieldErrors.username}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              type="password"
              defaultValue={actionData?.fields?.password}
              aria-invalid={Boolean(
                actionData?.fieldErrors?.password
              )}
              aria-errormessage={
                actionData?.fieldErrors?.password
                  ? "password-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id="form-error-message">
            {actionData?.formError ? (
              <p
                className="form-validation-error"
                role="alert"
              >
                {actionData.formError}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/jokes">Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
```


## session.server.ts
- login function export하는 로직
- username 쿼리 to prisma  / user가 존재하지 않으면 null 반환
- bcrypt.compare 로 패스워드 해쉬 비교

```javascript
import bcrypt from "bcryptjs";

import { db } from "./db.server";

type LoginForm = {
  password: string;
  username: string;
};

export async function login({
  password,
  username,
}: LoginForm) {
  const user = await db.user.findUnique({
    where: { username },
  });
  if (!user) {
    return null;
  }

  const isCorrectPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );
  if (!isCorrectPassword) {
    return null;
  }

  return { id: user.id, username };
}
```

## app/routes/login.tsx
- session.server.ts 의 login함수 가져와서 로그인 실패시 basRequest 반환

## app/utils/session.server.ts
- cookieSessionStorage 만들기
- 만든 쿠키세션저장소에 UserSession생성해서 넣기
-  set-Cookie 헤더에 있는 route로 리다이렉트 하기 

## app/routes/login.tsx
- 로그인 성공시 UserSession을 만들고 redirect 하기

## app/utils/session.server.ts
- getUserSession (header에 있는 Cookie 값 가져오기)
- getUserId 추가하기 : getUserSession이 반환하는 Cookie값에서 userId 값 뽑아내기
- requireUserId 로 원하는곳으로 redirect
  - userId가 없으면 login 페이지로 redirect 를 throw
  - URL.pathname 과 URLSearchParams의 조합

## app/routes/jokes.new.tsx
- userId를 가져와 해당 userId로 joke create하기. 

## app/utils/session.server.ts logout 추가
- logout에 해당 세션 destroySession 하기

## app/routes/jokes.tsx 
- loader의 data에 user가 있으면 logout 없으면 login

## app/routes/logout.tsx
- session.servert.ts의 logout함수 가져오고 ("/")로 redirect

# User Registration
## app/utils/session.server.ts
- register 함수
   
## app/routes/login.tsx
- register 함수 등록

# handling unexpected error
## app/root.tsx
- remix의 ErrorBoundary 컴포넌트를 사용할거임(리액트랑 비슷함)
- root.tsx 에 <Document><Outlet /></Document> 구조로 만들고
- ErrorBoudary 만듬

## app/routes/jokes.$jokeId.tsx
- ErrorBoudary 만듬
## app/routes/jokes._index.tsx
- ErrorBoudary 만듬

# handling expected error
- expected error 400-level error(client error)
- unexpected error 500-level error(server error)
## app/root.tsx
- isRouteErrorResponse (: client error response를 체크) 추가
## app/routes/jokes.$jokeId.tsx
## app/routes/jokes._index.tsx
## app/routes/jokes.new.tsx
- isRouteErrorResponse 추가 / throw error 하면 useRouteError에서 error를 받음

# owner에게 delete 권한 주기
-  이거 복잡하네! 

# SEO with Meta tags
- root.tsx / login.tsx / jokeId.tsx 에 MetaFunction 추가 및 페이지 설명 추가

# Resource Routes
- rss feed 만들기

# root.tsx 에 scripts 태그 추가
- 서버사이드 코드에도 console.log 볼수 있게! 
- 한번에 모든 script를 로드할수 있음. 

# remix 의 Form 컴포넌트로 교체하기 from form.
- javascript form 보다의 장점. full-page reload를 하지 않는 장점! 

# Prefetching
- 링크위에 마우스 오버 or focus를 하면 페이지 prefetch하기. 
  
# Optimistic UI
- 서버사이트 검증이 실패해도 UI가 깨지진 않아. 