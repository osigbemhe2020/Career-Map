'use client';

import React, { useState } from "react";
import styled from "styled-components";
import Image from "next/image";
import colors from "@/lib/colors";

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${colors.background || "#09051d"};
  color: ${colors.normalWhite || "#ffffff"};
`;

/* Sidebar */
const Sidebar = styled.aside`
  width: 260px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: 900px) {
    display: none;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 36px;
`;

const NavItem = styled.a<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  color: ${(p) => (p.$active ? "#ffffff" : colors.muted || "#94a3b8")};
  background: ${(p) => (p.$active ? colors.purpleSoft || "rgba(119,59,236,0.25)" : "transparent")};

  div {
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const BadgeCount = styled.span`
  background: ${colors.buttonPurple || "#773bec"};
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
`;

const AvatarCircle = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: ${colors.buttonPurple || "#773bec"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

/* Main Chat Content */
const Main = styled.main`
  flex: 1;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const SearchInput = styled.div`
  position: relative;
  width: 320px;

  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    color: #fff;
    outline: none;
    font-size: 13.5px;
  }

  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${colors.muted || "#94a3b8"};
  }
`;

const ChatGrid = styled.div`
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 20px;
  flex: 1;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ConversationsPanel = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const FilterTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 12px;
`;

const Tab = styled.button<{ $active?: boolean }>`
  background: transparent;
  border: none;
  color: ${(p) => (p.$active ? "#fff" : colors.muted || "#94a3b8")};
  font-size: 14px;
  font-weight: ${(p) => (p.$active ? "700" : "500")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ConversationItem = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  background: ${(p) => (p.$selected ? "rgba(119, 59, 236, 0.2)" : "transparent")};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
`;

const ChatDetails = styled.div`
  flex: 1;
  min-width: 0;

  h4 {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: ${colors.muted || "#94a3b8"};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: 11px;
  color: ${colors.muted || "#94a3b8"};
`;

const UnreadBadge = styled.span`
  background: ${colors.buttonPurple || "#773bec"};
  color: #fff;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
`;

/* Active Chat Box */
const ActiveChatPanel = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const MessagesArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 20px 0;
  flex: 1;
`;

const DateDivider = styled.div`
  text-align: center;
  font-size: 12px;
  color: ${colors.muted || "#94a3b8"};
`;

const Bubble = styled.div<{ $isSender?: boolean }>`
  max-width: 480px;
  padding: 14px 18px;
  border-radius: ${(p) => (p.$isSender ? "16px 16px 4px 16px" : "16px 16px 16px 4px")};
  background: ${(p) => (p.$isSender ? colors.buttonPurple || "#773bec" : "rgba(255, 255, 255, 0.08)")};
  align-self: ${(p) => (p.$isSender ? "flex-end" : "flex-start")};
  font-size: 13.5px;
  line-height: 1.5;
`;

const InputBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 16px;

  input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    outline: none;
    font-size: 14px;
  }
`;

const IconBtn = styled.button`
  background: transparent;
  border: none;
  color: ${colors.muted || "#94a3b8"};
  cursor: pointer;
`;

export default function MentorMessagesPage() {
  const [selectedId, setSelectedId] = useState(1);

  const conversations = [
    { id: 1, name: "Chukwudi Innocent", topic: "Interested in Software Engineering", time: "10:45 AM", unread: 2 },
    { id: 2, name: "Boluwatife Ahmed", topic: "Thank you so much...", time: "10:42 AM", unread: 1 },
    { id: 3, name: "Ibrahim Haruna", topic: "Thank you so much...", time: "10:35 AM", unread: 2 },
    { id: 4, name: "Georgia Stephen", topic: "Thank you so much...", time: "10:30 AM", unread: 2 },
  ];

  return (
    <Layout>
      <Sidebar>
        <div>
          <div style={{ fontWeight: 700, fontSize: "20px" }}>CareerMap</div>
          <Nav>
            {/* <NavItem href="/mentor/dashboard">Dashboard</NavItem> */}
            <NavItem href="/mentor/messages" $active>
              <div>Messages</div>
              <BadgeCount>5</BadgeCount>
            </NavItem>
            {/* <NavItem href="/mentor/mentees">Mentees</NavItem>
                        <NavItem href="/mentor/profile">Profile</NavItem>
                        <NavItem href="/mentor/settings">Settings</NavItem> */}
          </Nav>
        </div>

        <UserProfile>
          <AvatarCircle>PD</AvatarCircle>
          <div>
            <div style={{ fontWeight: 600, fontSize: "14px" }}>Paul Dirisu</div>
          </div>
        </UserProfile>
      </Sidebar>

      <Main>
        <Header>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: "24px" }}>Messages</h1>
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>Stay connected and support your mentees</span>
          </div>

          <SearchInput>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Search messages" />
          </SearchInput>
        </Header>

        <ChatGrid>
          <ConversationsPanel>
            <FilterTabs>
              <Tab $active>All <BadgeCount>6</BadgeCount></Tab>
              <Tab>Unread <BadgeCount>4</BadgeCount></Tab>
              <Tab>Archived</Tab>
            </FilterTabs>

            {conversations.map((item) => (
              <ConversationItem
                key={item.id}
                $selected={item.id === selectedId}
                onClick={() => setSelectedId(item.id)}
              >
                <AvatarCircle style={{ width: 38, height: 38, fontSize: 13 }}>CI</AvatarCircle>
                <ChatDetails>
                  <h4>{item.name}</h4>
                  <p>{item.topic}</p>
                </ChatDetails>
                <Meta>
                  <span>{item.time}</span>
                  {item.unread > 0 && <UnreadBadge>{item.unread}</UnreadBadge>}
                </Meta>
              </ConversationItem>
            ))}
          </ConversationsPanel>

          <ActiveChatPanel>
            <ChatHeader>
              <AvatarCircle>CI</AvatarCircle>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px" }}>Chukwudi Innocent</h3>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Interested in Software Engineering</span>
              </div>
            </ChatHeader>

            <MessagesArea>
              <DateDivider>Today</DateDivider>
              <Bubble $isSender={false}>
                Hi Paul, I just took the career quiz and found out my strength leans towards Software Engineering. I'm really interested in becoming a Software Engineer and would love to learn from your experience.
              </Bubble>
              <Bubble $isSender>
                Hi Chukwudi! I'm happy to help, what would you like to know?
              </Bubble>
            </MessagesArea>

            <InputBar>
              <IconBtn>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </IconBtn>
              <input placeholder="Type a message..." />
              <IconBtn style={{ color: "#773bec" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </IconBtn>
            </InputBar>
          </ActiveChatPanel>
        </ChatGrid>
      </Main>
    </Layout>
  );
}